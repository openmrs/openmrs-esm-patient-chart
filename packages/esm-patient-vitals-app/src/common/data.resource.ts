import { useCallback, useEffect, useMemo } from 'react';
import {
  type FHIRResource,
  type FetchResponse,
  fhirBaseUrl,
  restBaseUrl,
  openmrsFetch,
  useConfig,
} from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import useSWRInfinite from 'swr/infinite';
import { type ObsRecord } from '@openmrs/esm-patient-common-lib';
import { type KeyedMutator } from 'swr';
import { type ConfigObject } from '../config-schema';
import { assessValue, calculateBodyMassIndex, getReferenceRangesForConcept, interpretBloodPressure } from './helpers';
import type { FHIRSearchBundleResponse, MappedVitals, PatientVitalsAndBiometrics, VitalsResponse } from './types';
import { type VitalsBiometricsFormData } from '../vitals-biometrics-form/vitals-biometrics-form.workspace';

const pageSize = 100;

/** We use this as the first value to the SWR key to be able to invalidate all relevant cached entries */
const swrKeyNeedle = Symbol('vitalsAndBiometrics');

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
  results: Array<{
    setMembers: Array<ConceptMetadata>;
  }>;
}

function getInterpretationKey(header: string) {
  // Reason for `Render` string is to match the column header in the table
  return `${header}RenderInterpretation`;
}

export function useVitalsConceptMetadata() {
  const customRepresentation =
    'custom:(setMembers:(uuid,display,hiNormal,hiAbsolute,hiCritical,lowNormal,lowAbsolute,lowCritical,units))';

  const apiUrl = `${restBaseUrl}/concept/?q=VITALS SIGNS&v=${customRepresentation}`;

  const { data, error, isLoading } = useSWRImmutable<{ data: VitalsConceptMetadataResponse }, Error>(
    apiUrl,
    openmrsFetch,
  );

  const conceptMetadata = data?.data?.results[0]?.setMembers;

  const conceptUnits = conceptMetadata?.length
    ? new Map<string, string>(conceptMetadata.map((concept) => [concept.uuid, concept.units]))
    : new Map<string, string>([]);

  const conceptRanges = conceptMetadata?.length
    ? new Map<string, { lowAbsolute: number | null; highAbsolute: number | null }>(
        conceptMetadata.map((concept) => [
          concept.uuid,
          {
            lowAbsolute: concept.lowAbsolute ?? null,
            highAbsolute: concept.hiAbsolute ?? null,
          },
        ]),
      )
    : new Map<string, { lowAbsolute: number | null; highAbsolute: number | null }>([]);

  return {
    data: conceptUnits,
    error,
    isLoading,
    conceptMetadata,
    conceptRanges,
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
const vitalsHooksMutates = new Map<number, KeyedMutator<VitalsFetchResponse[]>>();

/**
 * Hook to get the vitals and / or biometrics for a patient
 *
 * @param patientUuid The uuid of the patient to get the vitals for
 * @param mode Either 'vitals', to load only vitals, 'biometrics', to load only biometrics or 'both' to load both
 * @returns An SWR-like structure that includes the cleaned-up vitals
 */
export function useVitalsAndBiometrics(patientUuid: string, mode: VitalsAndBiometricsMode = 'vitals') {
  const { conceptMetadata } = useVitalsConceptMetadata();
  const { concepts } = useConfig<ConfigObject>();
  const biometricsConcepts = useMemo(
    () => [concepts.heightUuid, concepts.midUpperArmCircumferenceUuid, concepts.weightUuid],
    [concepts.heightUuid, concepts.midUpperArmCircumferenceUuid, concepts.weightUuid],
  );

  const conceptUuids = useMemo(
    () =>
      (mode === 'both'
        ? Object.values(concepts)
        : Object.values(concepts).filter(
            (uuid) =>
              (mode === 'vitals' && !biometricsConcepts.includes(uuid)) ||
              (mode === 'biometrics' && biometricsConcepts.includes(uuid)),
          )
      ).join(','),
    [concepts, biometricsConcepts, mode],
  );

  const getPage = useCallback(
    (page: number, prevPageData: FHIRSearchBundleResponse): VitalsAndBiometricsSwrKey => ({
      swrKeyNeedle,
      mode,
      patientUuid,
      conceptUuids,
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
      .map(vitalsProperties(conceptMetadata))
      ?.reduce((vitalsHashTable, vitalSign) => {
        const recordedDate = new Date(new Date(vitalSign.recordedDate)).toISOString();

        if (vitalsHashTable.has(recordedDate) && vitalsHashTable.get(recordedDate)) {
          vitalsHashTable.set(recordedDate, {
            ...vitalsHashTable.get(recordedDate),
            [getVitalsMapKey(vitalSign.code)]: vitalSign.value,
            [getInterpretationKey(getVitalsMapKey(vitalSign.code))]: vitalSign.interpretation,
          });
        } else {
          vitalSign.value &&
            vitalsHashTable.set(recordedDate, {
              [getVitalsMapKey(vitalSign.code)]: vitalSign.value,
              [getInterpretationKey(getVitalsMapKey(vitalSign.code))]: vitalSign.interpretation,
            });
        }

        return vitalsHashTable;
      }, new Map<string, Partial<PatientVitalsAndBiometrics>>());

    return Array.from(vitalsHashTable ?? []).map(([date, vitalSigns], index) => {
      const result = {
        id: index.toString(),
        date: date,
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
          conceptMetadata,
        );
      }

      return result;
    });
  }, [data, conceptMetadata, getVitalsMapKey, concepts, mode]);

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
function vitalsProperties(conceptMetadata: Array<ConceptMetadata> | undefined) {
  return (resource: FHIRResource['resource']): MappedVitals => ({
    code: resource?.code?.coding?.[0]?.code,
    interpretation: assessValue(
      resource?.valueQuantity?.value,
      getReferenceRangesForConcept(resource?.code?.coding?.[0]?.code, conceptMetadata),
    ),
    recordedDate: resource?.effectiveDateTime,
    value: resource?.valueQuantity?.value,
  });
}

export function saveVitalsAndBiometrics(
  encounterTypeUuid: string,
  formUuid: string,
  concepts: ConfigObject['concepts'],
  patientUuid: string,
  vitals: VitalsBiometricsFormData,
  abortController: AbortController,
  location: string,
) {
  return openmrsFetch<unknown>(`${restBaseUrl}/encounter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: {
      patient: patientUuid,
      location: location,
      encounterType: encounterTypeUuid,
      form: formUuid,
      obs: createObsObject(vitals, concepts),
    },
  });
}

export function updateVitalsAndBiometrics(
  concepts: ConfigObject['concepts'],
  patientUuid: string,
  vitals: VitalsBiometricsFormData,
  encounterDatetime: Date,
  abortController: AbortController,
  encounterUuid: string,
  location: string,
) {
  return openmrsFetch(`${restBaseUrl}/encounter/${encounterUuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: {
      encounterDatetime: encounterDatetime,
      location: location,
      patient: patientUuid,
      obs: createObsObject(vitals, concepts),
      orders: [],
    },
  });
}

function createObsObject(
  vitals: VitalsBiometricsFormData,
  concepts: ConfigObject['concepts'],
): Array<Omit<ObsRecord, 'effectiveDateTime' | 'conceptClass' | 'encounter'>> {
  return Object.entries(vitals)
    .filter(([_, result]) => Boolean(result))
    .map(([name, result]) => {
      return {
        concept: concepts[name + 'Uuid'],
        value: result,
      };
    });
}

/**
 * Invalidate all useVitalsAndBiometrics hooks data, to force them to reload
 */
export async function invalidateCachedVitalsAndBiometrics() {
  vitalsHooksMutates.forEach((mutate) => mutate());
}
