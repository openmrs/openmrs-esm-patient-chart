import { useCallback, useMemo } from 'react';
import { type FHIRResource, type FetchResponse, fhirBaseUrl, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { type ObsRecord, useVitalsConceptMetadata } from '@openmrs/esm-patient-common-lib';
import { type Arguments, mutate } from 'swr';
import useSWRInfinite from 'swr/infinite';
import { type ConfigObject } from '../config-schema';
import type { MappedVitals, PatientVitals, VitalsResponse } from './types';
import { assessValue, calculateBodyMassIndex, getReferenceRangesForConcept, interpretBloodPressure } from './helpers';
import { type VitalsBiometricsFormData } from '../vitals-biometrics-form/vitals-biometrics-form.component';

const pageSize = 100;

/** We use this as the first value to the SWR key to be able to invalidate all relevant cached entries */
const swrKeyNeedle = Symbol('vitalsAndBiometrics');

type FHIRSearchBundleResponse = FetchResponse<{
  entry: Array<FHIRResource>;
  link: Array<{ relation: string; url: string }>;
}>;

export function useVitalsAndBiometrics(patientUuid: string, mode: 'vitals' | 'biometrics' | 'both' = 'vitals') {
  const { conceptMetadata } = useVitalsConceptMetadata();
  const { concepts } = useConfig<ConfigObject>();
  const biometricsConcepts = [concepts.heightUuid, concepts.midUpperArmCircumferenceUuid, concepts.weightUuid];

  const conceptUuids = useMemo(
    () =>
      mode === 'both'
        ? Object.values(concepts).join(',')
        : Object.values(concepts)
            .filter(
              (uuid) =>
                (mode === 'vitals' && !biometricsConcepts.includes(uuid)) ||
                (mode === 'biometrics' && biometricsConcepts.includes(uuid)),
            )
            .join(','),
    [concepts, biometricsConcepts],
  );

  const getPage = useCallback((page: number, prevData: FHIRSearchBundleResponse) => {
    return [swrKeyNeedle, mode, page, prevData];
  }, []);

  const handleFetch = useCallback(
    ([, , page, prevPageData]: [typeof swrKeyNeedle, typeof mode, number, FHIRSearchBundleResponse]) => {
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

      return openmrsFetch<VitalsResponse>(url);
    },
    [conceptUuids, patientUuid],
  );

  const { data, isValidating, setSize, error, size, mutate } = useSWRInfinite<FetchResponse<VitalsResponse>, Error>(
    getPage,
    handleFetch,
  );

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
      default:
        throw { message: `Unrecognised concept ${conceptUuid}` };
    }
  };

  const vitalsProperties = (resource: FHIRResource['resource']): MappedVitals => ({
    code: resource?.code?.coding?.[0]?.code,
    interpretation: assessValue(
      resource?.valueQuantity?.value,
      getReferenceRangesForConcept(resource?.code?.coding?.[0]?.code, conceptMetadata),
    ),
    recordedDate: resource?.effectiveDateTime,
    value: resource?.valueQuantity?.value,
  });

  const vitalsHashTable = new Map<string, Partial<PatientVitals>>();
  const vitalsResponse = data?.[0]?.data?.entry?.map((entry) => entry.resource ?? []).map(vitalsProperties);

  vitalsResponse?.map((vitalSign) => {
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
  });

  const formattedObs: Array<PatientVitals> = Array.from(vitalsHashTable).map(([date, vitalSigns], index) => {
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

export function invalidateVitalsAndBiometrics() {}

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

export function invalidateCachedVitalsAndBiometrics() {
  mutate((key: Arguments) => Array.isArray(key) && key.length > 0 && key[0] === 'vitalsAndBiometrics');
}
