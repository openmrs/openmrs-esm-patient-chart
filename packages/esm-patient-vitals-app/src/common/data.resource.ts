import { useCallback, useEffect, useMemo } from 'react';
import { type FHIRResource, type FetchResponse, fhirBaseUrl, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { type ObsRecord, useVitalsConceptMetadata, ConceptMetadata } from '@openmrs/esm-patient-common-lib';
import { type KeyedMutator } from 'swr';
import useSWRInfinite from 'swr/infinite';
import { type ConfigObject } from '../config-schema';
import type { FHIRSearchBundleResponse, MappedVitals, PatientVitals, VitalsResponse } from './types';
import { assessValue, calculateBodyMassIndex, getReferenceRangesForConcept, interpretBloodPressure } from './helpers';
import { type VitalsBiometricsFormData } from '../vitals-biometrics-form/vitals-biometrics-form.component';

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
  const biometricsConcepts = [concepts.heightUuid, concepts.midUpperArmCircumferenceUuid, concepts.weightUuid];

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
    [concepts, biometricsConcepts],
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
    [swrKeyNeedle, mode, conceptUuids],
  );

  const { data, isValidating, setSize, error, size, mutate } = useSWRInfinite<VitalsFetchResponse, Error>(
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

  const getVitalsMapKey = (conceptUuid: string): string => {
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
    }
  };

  const formattedObs: Array<PatientVitals> = useMemo(() => {
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
            [getVitalsMapKey(vitalSign.code) + 'Interpretation']: vitalSign.interpretation,
          });
        } else {
          vitalSign.value &&
            vitalsHashTable.set(recordedDate, {
              [getVitalsMapKey(vitalSign.code)]: vitalSign.value,
              [getVitalsMapKey(vitalSign.code) + 'Interpretation']: vitalSign.interpretation,
            });
        }

        return vitalsHashTable;
      }, new Map<string, Partial<PatientVitals>>());

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
        result.bloodPressureInterpretation = interpretBloodPressure(
          vitalSigns.systolic,
          vitalSigns.diastolic,
          concepts,
          conceptMetadata,
        );
      }

      return result;
    });
  }, [data, conceptMetadata, getVitalsMapKey]);

  return {
    data: data ? formattedObs : undefined,
    isLoading: !data && !error,
    isError: error,
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
  encounterDatetime: Date,
  abortController: AbortController,
  location: string,
) {
  return openmrsFetch<unknown>(`/ws/rest/v1/encounter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: {
      patient: patientUuid,
      encounterDatetime: encounterDatetime,
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
  return openmrsFetch(`/ws/rest/v1/encounter/${encounterUuid}`, {
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
