import { useCallback, useEffect, useMemo } from 'react';
import {
  type FHIRResource,
  type FetchResponse,
  fhirBaseUrl,
  restBaseUrl,
  openmrsFetch,
  useConfig,
  type OpenmrsResource,
} from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import useSWRInfinite from 'swr/infinite';
import { type ConfigObject } from '../config-schema';
import {
  assessValue,
  calculateBodyMassIndex,
  interpretBloodPressure,
  mapFhirInterpretationToObservationInterpretation,
} from './helpers';
import type {
  FHIRObservationResource,
  FHIRSearchBundleResponse,
  MappedVitals,
  PatientVitalsAndBiometrics,
  VitalsResponse,
} from './types';

const pageSize = 100;

const swrKeyNeedle = Symbol('vitalsAndBiometrics');
const encounterRepresentation =
  'custom:(uuid,encounterDatetime,encounterType:(uuid,display),obs:(uuid,concept:(uuid,display),value,interpretation))';

type ConceptRange = {
  display: string;
  hiAbsolute: number | null;
  hiCritical: number | null;
  hiNormal: number | null;
  lowAbsolute: number | null;
  lowCritical: number | null;
  lowNormal: number | null;
  units: string | null;
  uuid: string;
};

type VitalsAndBiometricsMode = 'vitals' | 'biometrics' | 'both';

type VitalsAndBiometricsSwrKey = {
  swrKeyNeedle: typeof swrKeyNeedle;
  mode: VitalsAndBiometricsMode;
  patientUuid: string;
  conceptUuids: string;
  page: number;
  prevPageData: FHIRSearchBundleResponse;
};

type VitalsFetchResponse = FetchResponse<VitalsResponse>;

export interface ConceptMetadata {
  uuid: string;
  display: string;
  hiNormal: number | null;
  hiAbsolute: number | null;
  hiCritical: number | null;
  lowNormal: number | null;
  lowAbsolute: number | null;
  lowCritical: number | null;
  units: string | null;
}

interface VitalsConceptMetadataResponse {
  setMembers: Array<ConceptMetadata>;
}

export type VitalsAndBiometricsFieldValuesMap = Map<string, { value: number | string; obs: OpenmrsResource }>;

interface PartialEncounter extends OpenmrsResource {
  encounterType: OpenmrsResource;
  encounterDatetime: string;
  obs: Array<OpenmrsResource>;
}

function getInterpretationKey(header: string) {
  return `${header}RenderInterpretation`;
}

export function useVitalsConceptMetadata(patientUuid: string) {
  const {
    concepts: {
      diastolicBloodPressureUuid,
      oxygenSaturationUuid,
      pulseUuid,
      respiratoryRateUuid,
      systolicBloodPressureUuid,
      temperatureUuid,
    },
  } = useConfig<ConfigObject>();

  const apiUrl = `${restBaseUrl}/conceptreferencerange/?patient=${patientUuid}&concept=${systolicBloodPressureUuid},${diastolicBloodPressureUuid},${pulseUuid},${temperatureUuid},${oxygenSaturationUuid},${respiratoryRateUuid}&v=full`;

  const { data, error, isLoading } = useSWRImmutable<{ data: any }, Error>(patientUuid ? apiUrl : null, openmrsFetch);

  const conceptMetadata = data?.data?.results;

  const conceptUnits = conceptMetadata?.length
    ? new Map<string, string>(conceptMetadata.map((concept: any) => [concept.uuid, concept.units]))
    : new Map<string, string>([]);

  const conceptRanges = useMemo(
    () =>
      conceptMetadata?.length
        ? conceptMetadata.map((concept: any) => ({
            uuid: concept.concept,
            display: concept.display,
            hiNormal: concept.hiNormal ?? null,
            hiAbsolute: concept.hiAbsolute ?? null,
            hiCritical: concept.hiCritical ?? null,
            lowNormal: concept.lowNormal ?? null,
            lowAbsolute: concept.lowAbsolute ?? null,
            lowCritical: concept.lowCritical ?? null,
            units: concept.units ?? null,
          }))
        : [],
    [conceptMetadata],
  );

  const conceptRangeMap = useMemo(
    () => new Map<string, ConceptRange>(conceptRanges.map((range: any) => [range.uuid, range])),
    [conceptRanges],
  );

  return {
    data: conceptUnits,
    error,
    isLoading,
    conceptMetadata,
    conceptRanges,
    conceptRangeMap,
  };
}

export function useConceptUnits() {
  const { concepts } = useConfig<ConfigObject>();
  const vitalSignsConceptSetUuid = concepts.vitalSignsConceptSetUuid;

  const customRepresentation = 'custom:(setMembers:(uuid,display,units))';

  const apiUrl = `${restBaseUrl}/concept/${vitalSignsConceptSetUuid}?v=${customRepresentation}`;

  const { data, error, isLoading } = useSWRImmutable<{ data: VitalsConceptMetadataResponse }, Error>(
    apiUrl,
    openmrsFetch,
  );

  const conceptMetadata = data?.data?.setMembers;

  const conceptUnits = conceptMetadata?.length
    ? new Map<string, string>(conceptMetadata.map((concept) => [concept.uuid, concept.units]))
    : new Map<string, string>([]);

  return {
    conceptUnits,
    error,
    isLoading,
  };
}

export const withUnit = (label: string, unit: string | null | undefined) => {
  return `${label} ${unit ? `(${unit})` : ''}`;
};

let vitalsHooksCounter = 0;
const vitalsHooksMutates = new Map<number, ReturnType<typeof useSWRInfinite<VitalsFetchResponse>>['mutate']>();

export function useVitalsOrBiometricsConcepts(mode: VitalsAndBiometricsMode) {
  const { concepts } = useConfig<ConfigObject>();

  const conceptUuids = useMemo(() => {
    const biometricsKeys = ['heightUuid', 'midUpperArmCircumferenceUuid', 'weightUuid'];

    if (!concepts) {
      return [];
    }

    return Object.entries(concepts)
      .filter(([key, conceptUuid]) => {
        if (!conceptUuid) {
          console.warn(`Missing UUID for concept ${key}`);
          return false;
        }
        if (mode === 'both') {
          return true;
        }
        return mode === 'vitals' ? !biometricsKeys.includes(key) : biometricsKeys.includes(key);
      })
      .map(([_, conceptUuid]) => conceptUuid);
  }, [concepts, mode]);

  return conceptUuids;
}

export function useVitalsAndBiometrics(patientUuid: string, mode: VitalsAndBiometricsMode = 'vitals') {
  const conceptUuids = useVitalsOrBiometricsConcepts(mode);
  const { concepts } = useConfig<ConfigObject>();
  const { conceptRanges } = useVitalsConceptMetadata(patientUuid);

  const getPage = useCallback(
    (page: number, prevPageData: FHIRSearchBundleResponse): VitalsAndBiometricsSwrKey => ({
      swrKeyNeedle,
      mode,
      patientUuid,
      conceptUuids: conceptUuids.join(','),
      page,
      prevPageData,
    }),
    [mode, conceptUuids, patientUuid],
  );

  const { data, isLoading, isValidating, setSize, error, size, mutate } = useSWRInfinite<VitalsFetchResponse, Error>(
    getPage,
    handleFetch,
  );

  useEffect(() => {
    const index = ++vitalsHooksCounter;
    vitalsHooksMutates.set(index, mutate);
    return () => {
      vitalsHooksMutates.delete(index);
    };
  }, [mutate]);

  const getVitalsMapKey = useCallback(
    (conceptUuid: string): string => {
      switch (conceptUuid) {
        case concepts.systolicBloodPressureUuid:
          return 'systolic';
        case concepts.diastolicBloodPressureUuid:
          return 'diastolic';
        case concepts.pulseUuid:
          return 'pulse';
        case concepts.temperatureUuid:
          return 'temperature';
        case concepts.oxygenSaturationUuid:
          return 'spo2';
        case concepts.respiratoryRateUuid:
          return 'respiratoryRate';
        case concepts.heightUuid:
          return 'height';
        case concepts.weightUuid:
          return 'weight';
        case concepts.midUpperArmCircumferenceUuid:
          return 'muac';
        default:
          return '';
      }
    },
    [concepts],
  );

  const formattedObs: Array<PatientVitalsAndBiometrics> = useMemo(() => {
    const vitalsHashTable = data?.[0]?.data?.entry
      ?.map((entry) => entry.resource)
      .filter(Boolean)
      .map(mapVitalsAndBiometrics)
      ?.reduce((hashTable: any, vitalSign: any) => {
        const encounterId = vitalSign.encounterId;
        const key = getVitalsMapKey(vitalSign.code);
        if (hashTable.has(encounterId)) {
          const existing = hashTable.get(encounterId);
          hashTable.set(encounterId, {
            ...existing,
            [key]: vitalSign.value,
            [getInterpretationKey(key)]: vitalSign.interpretation,
            [`${key}ReferenceRanges`]: vitalSign.referenceRanges,
          });
        } else {
          hashTable.set(encounterId, {
            date:
              typeof vitalSign.recordedDate === 'string'
                ? vitalSign.recordedDate
                : (vitalSign.recordedDate as any)?.toDateString?.() || vitalSign.recordedDate,
            [key]: vitalSign.value,
            [getInterpretationKey(key)]: vitalSign.interpretation,
            [`${key}ReferenceRanges`]: vitalSign.referenceRanges,
          });
        }
        return hashTable;
      }, new Map<string, any>());

    return Array.from(vitalsHashTable ?? []).map(([encounterId, vitalSigns]: [string, any]) => {
      const result: any = {
        id: encounterId,
        date: vitalSigns.date,
        ...vitalSigns,
      };

      if (mode === 'both' || mode === 'biometrics') {
        result.bmi = calculateBodyMassIndex(Number(vitalSigns.weight), Number(vitalSigns.height));
      }

      if (mode === 'both' || mode === 'vitals') {
        result.bloodPressureRenderInterpretation = interpretBloodPressure(
          vitalSigns.systolic,
          vitalSigns.diastolic,
          concepts,
          conceptRanges,
          vitalSigns.systolicRenderInterpretation,
          vitalSigns.diastolicRenderInterpretation,
        );
      }

      return result;
    });
  }, [conceptRanges, concepts, data, getVitalsMapKey, mode]);

  return {
    data: data ? (formattedObs as any) : undefined,
    isLoading,
    error,
    hasMore: data?.length ? !!data[data.length - 1].data?.link?.some((link: any) => link.relation === 'next') : false,
    isValidating,
    loadingNewData: isValidating,
    setPage: setSize,
    currentPage: size,
    totalResults: data?.[0]?.data?.total ?? undefined,
    mutate,
  };
}

export function useEncounterVitalsAndBiometrics(encounterUuid: string) {
  const { concepts } = useConfig<ConfigObject>();
  const fieldNameSuffix = 'Uuid';
  const url = encounterUuid ? `${restBaseUrl}/encounter/${encounterUuid}?v=${encounterRepresentation}` : null;

  const { data, isLoading, error, mutate } = useSWRImmutable<FetchResponse<PartialEncounter>, Error>(url, openmrsFetch);

  const vitalsAndBiometrics: VitalsAndBiometricsFieldValuesMap = useMemo(() => {
    if (!isLoading && data && concepts) {
      return data.data.obs.reduce((map, obs) => {
        let fieldName = Object.entries(concepts).find(([, value]) => value === obs.concept.uuid)?.[0];
        if (fieldName) {
          fieldName = fieldName.endsWith(fieldNameSuffix) ? fieldName.replace(fieldNameSuffix, '') : fieldName;
          map.set(fieldName, { value: obs.value, obs });
        }
        return map;
      }, new Map<string, any>());
    }
    return null;
  }, [isLoading, data, concepts]);

  return { isLoading, vitalsAndBiometrics, encounter: data?.data, error, mutate };
}

function handleFetch({ patientUuid, conceptUuids, page, prevPageData }: VitalsAndBiometricsSwrKey) {
  if (prevPageData && !prevPageData?.data?.link.some((link: any) => link.relation === 'next')) return null;
  let url = `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&code=${conceptUuids}&_summary=data&_sort=-date&_count=${pageSize}`;
  if (page) url += `&_getpagesoffset=${page * pageSize}`;
  return openmrsFetch<VitalsResponse>(url);
}

function mapVitalsAndBiometrics(resource: FHIRObservationResource): MappedVitals {
  const referenceRanges: any = {
    uuid: resource?.code?.coding?.[0]?.code,
    display: resource?.code?.text,
    units: resource.valueQuantity?.unit ?? null,
  };

  resource?.referenceRange?.forEach((range: any) => {
    const type = range.type?.coding?.[0]?.code;
    if (type === 'normal') {
      referenceRanges.hiNormal = range.high?.value;
      referenceRanges.lowNormal = range.low?.value;
    }
  });

  return {
    code: resource?.code?.coding?.[0]?.code,
    encounterId: extractEncounterUuid(resource.encounter),
    interpretation: resource.interpretation?.[0]?.coding?.[0]?.display
      ? mapFhirInterpretationToObservationInterpretation(resource.interpretation[0].coding[0].display)
      : assessValue(resource?.valueQuantity?.value, referenceRanges),
    recordedDate: resource?.effectiveDateTime,
    value: resource?.valueQuantity?.value,
    referenceRanges,
  } as MappedVitals;
}

function extractEncounterUuid(encounter: any): string {
  if (!encounter || !encounter.reference) return '';
  return encounter.reference.split('/')[1];
}

export async function invalidateCachedVitalsAndBiometrics() {
  vitalsHooksMutates.forEach((mutate) => mutate());
}
