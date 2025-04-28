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
import { assessValue, calculateBodyMassIndex, getReferenceRangesForConcept, interpretBloodPressure } from './helpers';
import type {
  FHIRObservationResource,
  FHIRSearchBundleResponse,
  MappedVitals,
  PatientVitalsAndBiometrics,
  VitalsResponse,
} from './types';

const pageSize = 100;

/** We use this as the first value to the SWR key to be able to invalidate all relevant cached entries */
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
  // Reason for `Render` string is to match the column header in the table
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
    ? new Map<string, string>(conceptMetadata.map((concept) => [concept.uuid, concept.units]))
    : new Map<string, string>([]);

  const conceptRanges = useMemo(
    () =>
      conceptMetadata?.length
        ? conceptMetadata.map((concept) => ({
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
    () => new Map<string, ConceptRange>(conceptRanges.map((range) => [range.uuid, range])),
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

// We need to track a bound mutator for basically every hook, because there does not appear to be
// a way to invalidate an SWRInfinite key that works other than using the bound mutator
// Each mutator is stored in the vitalsHooksMutates map and removed (via a useEffect hook) when the
// hook is unmounted.
let vitalsHooksCounter = 0;
const vitalsHooksMutates = new Map<number, ReturnType<typeof useSWRInfinite<VitalsFetchResponse>>['mutate']>();

/**
 * Hook to get concepts for vitals, biometrics or both
 */
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

/**
 * Hook to get the vitals and / or biometrics for a patient
 *
 * @param patientUuid The uuid of the patient to get the vitals for
 * @param mode Either 'vitals', to load only vitals, 'biometrics', to load only biometrics or 'both' to load both
 * @returns An SWR-like structure that includes the cleaned-up vitals
 */
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

  // see the comments above for why this is here
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
          return ''; // or throw an error for unknown conceptUuid
      }
    },
    [
      concepts.heightUuid,
      concepts.midUpperArmCircumferenceUuid,
      concepts.systolicBloodPressureUuid,
      concepts.oxygenSaturationUuid,
      concepts.diastolicBloodPressureUuid,
      concepts.pulseUuid,
      concepts.respiratoryRateUuid,
      concepts.temperatureUuid,
      concepts.weightUuid,
    ],
  );

  const formattedObs: Array<PatientVitalsAndBiometrics> = useMemo(() => {
    const vitalsHashTable = data?.[0]?.data?.entry
      ?.map((entry) => entry.resource)
      .filter(Boolean)
      .map(mapVitalsAndBiometrics)
      ?.reduce((vitalsHashTable, vitalSign) => {
        const encounterId = vitalSign.encounterId;
        if (vitalsHashTable.has(encounterId) && vitalsHashTable.get(encounterId)) {
          vitalsHashTable.set(encounterId, {
            ...vitalsHashTable.get(encounterId),
            [getVitalsMapKey(vitalSign.code)]: vitalSign.value,
            [getInterpretationKey(getVitalsMapKey(vitalSign.code))]: vitalSign.interpretation,
          });
        } else {
          vitalSign.value &&
            vitalsHashTable.set(encounterId, {
              date:
                typeof vitalSign.recordedDate === 'string'
                  ? vitalSign.recordedDate
                  : vitalSign.recordedDate.toDateString(),
              [getVitalsMapKey(vitalSign.code)]: vitalSign.value,
              [getInterpretationKey(getVitalsMapKey(vitalSign.code))]: vitalSign.interpretation,
            });
        }
        return vitalsHashTable;
      }, new Map<string, Partial<PatientVitalsAndBiometrics>>());

    return Array.from(vitalsHashTable ?? []).map(([encounterId, vitalSigns]) => {
      const result = {
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
        );
        result.pulseRenderInterpretation = assessValue(
          vitalSigns.pulse,
          getReferenceRangesForConcept(concepts.pulseUuid, conceptRanges),
        );
        result.temperatureRenderInterpretation = assessValue(
          vitalSigns.temperature,
          getReferenceRangesForConcept(concepts.temperatureUuid, conceptRanges),
        );
        result.spo2RenderInterpretation = assessValue(
          vitalSigns.spo2,
          getReferenceRangesForConcept(concepts.oxygenSaturationUuid, conceptRanges),
        );
        result.respiratoryRateRenderInterpretation = assessValue(
          vitalSigns.respiratoryRate,
          getReferenceRangesForConcept(concepts.respiratoryRateUuid, conceptRanges),
        );
      }

      return result;
    });
  }, [conceptRanges, concepts, data, getVitalsMapKey, mode]);

  return {
    data: data ? formattedObs : undefined,
    isLoading,
    error,
    hasMore: data?.length
      ? !!data[data.length - 1].data?.link?.some((link: { relation?: string }) => link.relation === 'next')
      : false,
    isValidating,
    loadingNewData: isValidating,
    setPage: setSize,
    currentPage: size,
    totalResults: data?.[0]?.data?.total ?? undefined,
    mutate,
  };
}

/**
 * Hook to get the vitals and biometrics for a patient associated with a specific encounter
 */
export function useEncounterVitalsAndBiometrics(encounterUuid: string) {
  const { concepts } = useConfig<ConfigObject>();
  const fieldNameSuffix = 'Uuid';
  const url = encounterUuid ? `${restBaseUrl}/encounter/${encounterUuid}?v=${encounterRepresentation}` : null;

  const { data, isLoading, error, mutate } = useSWRImmutable<FetchResponse<PartialEncounter>, Error>(url, openmrsFetch);

  const vitalsAndBiometrics: VitalsAndBiometricsFieldValuesMap = useMemo(() => {
    if (!isLoading && data && concepts) {
      return data.data.obs.reduce((vitalsAndBiometrics, obs) => {
        let fieldName = Object.entries(concepts).find(([, value]) => value === obs.concept.uuid)?.[0];

        if (fieldName) {
          fieldName = fieldName.endsWith(fieldNameSuffix) ? fieldName.replace(fieldNameSuffix, '') : fieldName;
          vitalsAndBiometrics.set(fieldName, {
            value: obs.value,
            obs,
          });
        }
        return vitalsAndBiometrics;
      }, new Map<string, { value: string; obs: OpenmrsResource }>());
    }
    return null;
  }, [isLoading, data, concepts]);

  const getRefinedInitialValues = useCallback(() => {
    const initialValues: Record<string, string | number> = {};
    if (vitalsAndBiometrics) {
      vitalsAndBiometrics.forEach((value, key) => {
        initialValues[key] = value.value;
      });
    }
    return initialValues;
  }, [vitalsAndBiometrics]);

  return {
    isLoading,
    vitalsAndBiometrics,
    encounter: data?.data,
    error,
    mutate,
    getRefinedInitialValues,
  };
}

/**
 * Fetcher for the useVitalsAndBiometricsHook
 * @internal
 */
function handleFetch({ patientUuid, conceptUuids, page, prevPageData }: VitalsAndBiometricsSwrKey) {
  if (prevPageData && !prevPageData?.data?.link.some((link) => link.relation === 'next')) {
    return null;
  }

  let url = `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&`;
  let urlSearchParams = new URLSearchParams();

  urlSearchParams.append('code', conceptUuids);
  urlSearchParams.append('_summary', 'data');
  urlSearchParams.append('_sort', '-date');
  urlSearchParams.append('_count', pageSize.toString());

  if (page) {
    urlSearchParams.append('_getpagesoffset', (page * pageSize).toString());
  }

  return openmrsFetch<VitalsResponse>(url + urlSearchParams.toString());
}

/**
 * Mapper that converts a FHIR Observation resource into a MappedVitals object.
 * @internal
 */
function mapVitalsAndBiometrics(resource: FHIRObservationResource): MappedVitals {
  const referenceRanges = {
    uuid: resource?.code?.coding?.[0]?.code,
    display: resource?.code?.text,
    hiNormal: null,
    hiAbsolute: null,
    hiCritical: null,
    lowNormal: null,
    lowAbsolute: null,
    lowCritical: null,
    units: resource.valueQuantity?.unit ?? null,
  };

  resource?.referenceRange?.forEach((range) => {
    const rangeType = range.type?.coding?.[0]?.code;
    const rangeSystem = range.type?.coding?.[0]?.system;

    if (rangeSystem === 'http://terminology.hl7.org/CodeSystem/referencerange-meaning') {
      if (rangeType === 'normal') {
        referenceRanges.hiNormal = range.high?.value ?? null;
        referenceRanges.lowNormal = range.low?.value ?? null;
      } else if (rangeType === 'treatment') {
        referenceRanges.hiCritical = range.high?.value ?? null;
        referenceRanges.lowCritical = range.low?.value ?? null;
      }
    } else if (rangeSystem === 'http://fhir.openmrs.org/ext/obs/reference-range' && rangeType === 'absolute') {
      referenceRanges.hiAbsolute = range.high?.value ?? null;
      referenceRanges.lowAbsolute = range.low?.value ?? null;
    }
  });

  return {
    code: resource?.code?.coding?.[0]?.code,
    encounterId: extractEncounterUuid(resource.encounter),
    interpretation: assessValue(resource?.valueQuantity?.value, referenceRanges),
    recordedDate: resource?.effectiveDateTime,
    value: resource?.valueQuantity?.value,
  };
}

export function createOrUpdateVitalsAndBiometrics(
  patientUuid: string,
  encounterTypeUuid: string,
  encounterUuid: string | null,
  location: string,
  vitalsAndBiometricsObs: Array<OpenmrsResource>,
  abortController: AbortController,
) {
  const url = encounterUuid ? `${restBaseUrl}/encounter/${encounterUuid}` : `${restBaseUrl}/encounter`;

  const encounter = {
    patient: patientUuid,
    obs: vitalsAndBiometricsObs,
  };
  if (!encounterUuid) {
    encounter['location'] = location;
    encounter['encounterType'] = encounterTypeUuid;
  }
  return openmrsFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: encounter,
  });
}

export function deleteEncounter(encounterUuid: string) {
  return openmrsFetch(`${restBaseUrl}/encounter/${encounterUuid}`, {
    method: 'DELETE',
  });
}

function extractEncounterUuid(encounter: FHIRResource['resource']['encounter']): string {
  if (!encounter || !encounter.reference) {
    return '';
  }
  return encounter.reference.split('/')[1];
}

/**
 * Invalidate all useVitalsAndBiometrics hooks data, to force them to reload
 */
export async function invalidateCachedVitalsAndBiometrics() {
  vitalsHooksMutates.forEach((mutate) => mutate());
}
