import { useCallback, useMemo } from 'react';
import useSwrInfinite from 'swr/infinite';
import { openmrsFetch, fhirBaseUrl, useConfig, FHIRResource, FetchResponse } from '@openmrs/esm-framework';
import { ObsMetaInfo, ConceptMetadata, useVitalsConceptMetadata } from '@openmrs/esm-patient-common-lib';
import { VitalsBiometricsFormData } from './vitals-biometrics-form/vitals-biometrics-form.component';
import { calculateBodyMassIndex } from './vitals-biometrics-form/vitals-biometrics-form.utils';
import { ConfigObject } from '../config-schema';

interface ObsRecord {
  concept: string;
  value: string | number;
}

export type ObservationInterpretation = 'critically_low' | 'critically_high' | 'high' | 'low' | 'normal';

type MappedVitals = {
  code: string;
  interpretation: string;
  recordedDate: Date;
  value: number;
};

export interface PatientVitals {
  id: string;
  date: string;
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  temperature?: number;
  spo2?: number;
  height?: number;
  weight?: number;
  bmi?: number | null;
  respiratoryRate?: number;
  muac?: number;
}

interface VitalsFetchResponse {
  entry: Array<{
    resource: FHIRResource['resource'];
  }>;
  id: string;
  meta: {
    lastUpdated: string;
  };
  link: Array<{
    relation: string;
    url: string;
  }>;
  resourceType: string;
  total: number;
  type: string;
}

export const pageSize = 100;

export function useVitals(patientUuid: string, includeBiometrics: boolean = false) {
  const { concepts } = useConfig();
  const { conceptMetadata } = useVitalsConceptMetadata();
  const biometricsConcepts = [concepts.heightUuid, concepts.midUpperArmCircumferenceUuid, concepts.weightUuid];

  const conceptUuids = includeBiometrics
    ? Object.values(concepts).join(',')
    : Object.values(concepts)
        .filter((uuid) => !biometricsConcepts.includes(uuid))
        .join(',');

  const getUrl = useCallback(
    (page, prevPageData) => {
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

      return url + urlSearchParams.toString();
    },
    [conceptUuids, patientUuid],
  );

  const { data, isValidating, setSize, error, size, mutate } = useSwrInfinite<{ data: VitalsFetchResponse }, Error>(
    getUrl,
    openmrsFetch,
  );

  const getVitalSignKey = (conceptUuid: string): string => {
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

  const mapVitalsProperties = (resource: FHIRResource['resource']): MappedVitals => ({
    code: resource?.code?.coding?.[0]?.code,
    interpretation: assessValue(
      resource?.valueQuantity?.value,
      getReferenceRangesForConcept(resource?.code?.coding?.[0]?.code, conceptMetadata),
    ),
    recordedDate: resource?.effectiveDateTime,
    value: resource?.valueQuantity?.value,
  });

  const vitalsHashTable = new Map<string, Partial<PatientVitals>>();
  const vitalsResponse = data?.[0]?.data?.entry?.map((entry) => entry.resource ?? []).map(mapVitalsProperties);

  vitalsResponse?.map((vitalSign) => {
    const recordedDate = new Date(new Date(vitalSign.recordedDate)).toISOString();

    if (vitalsHashTable.has(recordedDate) && vitalsHashTable.get(recordedDate)) {
      vitalsHashTable.set(recordedDate, {
        ...vitalsHashTable.get(recordedDate),
        [getVitalSignKey(vitalSign.code)]: vitalSign.value,
        [getVitalSignKey(vitalSign.code) + 'Interpretation']: vitalSign.interpretation,
      });
    } else {
      vitalSign.value &&
        vitalsHashTable.set(recordedDate, {
          [getVitalSignKey(vitalSign.code)]: vitalSign.value,
          [getVitalSignKey(vitalSign.code) + 'Interpretation']: vitalSign.interpretation,
        });
    }
  });

  const formattedVitals: Array<PatientVitals> = Array.from(vitalsHashTable).map(([date, vitalSigns], index) => {
    return {
      ...vitalSigns,
      id: index.toString(),
      bmi: calculateBodyMassIndex(Number(vitalSigns.weight), Number(vitalSigns.height)),
      date: date,
      bloodPressureInterpretation: interpretBloodPressure(
        vitalSigns.systolic,
        vitalSigns.diastolic,
        concepts,
        conceptMetadata,
      ),
    };
  });

  const results = useMemo(
    () => ({
      vitals: data ? [].concat(formattedVitals) : null,
      isLoading: !data && !error,
      isError: error,
      hasMore: data?.length ? !!data?.[data?.length - 1].data?.link?.some((link) => link.relation === 'next') : false,
      isValidating,
      loadingNewData: isValidating,
      setPage: setSize,
      currentPage: size,
      totalResults: data?.[0]?.data?.total ?? null,
      mutate,
    }),
    [data, isValidating, error, setSize, size, formattedVitals, mutate],
  );
  return results;
}

export function savePatientVitals(
  encounterTypeUuid: string,
  formUuid: string,
  concepts: ConfigObject['concepts'],
  patientUuid: string,
  vitals: VitalsBiometricsFormData,
  encounterDatetime: Date,
  abortController: AbortController,
  location: string,
) {
  return openmrsFetch(`/ws/rest/v1/encounter`, {
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

function createObsObject(vitals: VitalsBiometricsFormData, concepts: ConfigObject['concepts']): Array<ObsRecord> {
  return Object.entries(vitals)
    .filter(([_, result]) => Boolean(result))
    .map(([name, result]) => {
      return {
        concept: concepts[name + 'Uuid'],
        value: result,
      };
    });
}

export function editPatientVitals(
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

export function assessValue(value: number, range: ObsMetaInfo): ObservationInterpretation {
  if (range?.hiCritical && value >= range.hiCritical) {
    return 'critically_high';
  }

  if (range?.hiNormal && value > range.hiNormal) {
    return 'high';
  }

  if (range?.lowCritical && value <= range.lowCritical) {
    return 'critically_low';
  }

  if (range?.lowNormal && value < range.lowNormal) {
    return 'low';
  }

  return 'normal';
}

export function hasAbnormalValues(vitals: PatientVitals): boolean {
  const interpretations = Object.entries(vitals)
    .filter(([key]) => key.match(/interpretation/i))
    .map(([, value]) => value);

  return interpretations.some((value) => value !== 'normal');
}

export function getReferenceRangesForConcept(
  conceptUuid: string,
  conceptMetadata: Array<ConceptMetadata>,
): ConceptMetadata {
  if (!conceptUuid || !conceptMetadata?.length) return null;

  return conceptMetadata?.find((metadata) => metadata.uuid === conceptUuid);
}

export function interpretBloodPressure(systolic, diastolic, concepts, conceptMetadata) {
  const systolicAssessment = assessValue(
    systolic,
    getReferenceRangesForConcept(concepts?.systolicBloodPressureUuid, conceptMetadata),
  );

  const diastolicAssessment = assessValue(
    diastolic,
    getReferenceRangesForConcept(concepts?.diastolicBloodPressureUuid, conceptMetadata),
  );

  if (systolicAssessment === 'critically_high' || diastolicAssessment === 'critically_high') {
    return 'critically_high';
  }

  if (systolicAssessment === 'critically_low' || diastolicAssessment === 'critically_low') {
    return 'critically_low';
  }

  if (systolicAssessment === 'high' || diastolicAssessment === 'high') {
    return 'high';
  }

  if (systolicAssessment === 'low' || diastolicAssessment === 'low') {
    return 'low';
  }

  return 'normal';
}
