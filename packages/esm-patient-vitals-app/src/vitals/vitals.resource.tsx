import useSWR from 'swr';
import { openmrsFetch, fhirBaseUrl, useConfig, FHIRResource } from '@openmrs/esm-framework';
import { ObsMetaInfo, ConceptMetadata, useVitalsConceptMetadata } from '@openmrs/esm-patient-common-lib';
import { PatientVitalsAndBiometrics } from './vitals-biometrics-form/vitals-biometrics-form.component';
import { calculateBMI } from './vitals-biometrics-form/vitals-biometrics-form.utils';
import { ConfigObject } from '../config-schema';

interface ObsRecord {
  concept: string;
  value: string | number;
}

export type ObservationInterpretation = 'critically_low' | 'critically_high' | 'high' | 'low' | 'normal';

type MappedVitals = {
  code: string;
  interpretation: string;
  issued: Date;
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

  const apiUrl =
    `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&code=` +
    conceptUuids +
    '&_summary=data&_sort=-date' +
    `&_count=${pageSize}
        `;

  const { data, error, isValidating } = useSWR<{ data: VitalsFetchResponse }, Error>(apiUrl, openmrsFetch);

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
    issued: resource?.issued,
    value: resource?.valueQuantity?.value,
  });

  const vitalsHashTable = new Map<string, Partial<PatientVitals>>();
  const vitalsResponse = data?.data?.entry?.map((entry) => entry.resource ?? []).map(mapVitalsProperties);

  vitalsResponse?.map((vitalSign) => {
    const issuedDate = new Date(new Date(vitalSign.issued).setSeconds(0, 0)).toISOString();

    if (vitalsHashTable.has(issuedDate) && vitalsHashTable.get(issuedDate)) {
      vitalsHashTable.set(issuedDate, {
        ...vitalsHashTable.get(issuedDate),
        [getVitalSignKey(vitalSign.code)]: vitalSign.value,
        [getVitalSignKey(vitalSign.code) + 'Interpretation']: vitalSign.interpretation,
      });
    } else {
      vitalSign.value &&
        vitalsHashTable.set(issuedDate, {
          [getVitalSignKey(vitalSign.code)]: vitalSign.value,
          [getVitalSignKey(vitalSign.code) + 'Interpretation']: vitalSign.interpretation,
        });
    }
  });

  const formattedVitals: Array<PatientVitals> = Array.from(vitalsHashTable).map(([date, vitalSigns], index) => {
    return {
      ...vitalSigns,
      id: index.toString(),
      bmi: calculateBMI(Number(vitalSigns.weight), Number(vitalSigns.height)),
      date: date,
      bloodPressureInterpretation: interpretBloodPressure(
        vitalSigns.diastolic,
        vitalSigns.systolic,
        concepts,
        conceptMetadata,
      ),
    };
  });

  return {
    vitals: formattedVitals,
    isError: error,
    isLoading: !data && !error,
    isValidating,
  };
}

export function savePatientVitals(
  encounterTypeUuid: string,
  formUuid: string,
  concepts: ConfigObject['concepts'],
  patientUuid: string,
  vitals: PatientVitalsAndBiometrics,
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

function createObsObject(vitals: PatientVitalsAndBiometrics, concepts: ConfigObject['concepts']): Array<ObsRecord> {
  return Object.entries(vitals)
    .filter(([_, result]) => result != null)
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
  vitals: PatientVitalsAndBiometrics,
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

export function exists(...args: any[]): boolean {
  for (const y of args) {
    if (y === null || y === undefined) {
      return false;
    }
  }

  return true;
}

export function assessValue(value: number, range: ObsMetaInfo): ObservationInterpretation {
  if (exists(range?.hiCritical) && value >= range.hiCritical) {
    return 'critically_high';
  }

  if (exists(range?.hiNormal) && value > range.hiNormal) {
    return 'high';
  }

  if (exists(range?.lowCritical) && value <= range.lowCritical) {
    return 'critically_low';
  }

  if (exists(range?.lowNormal) && value < range.lowNormal) {
    return 'low';
  }

  return 'normal';
}

export function assessAllValues(
  vitals: PatientVitals,
  config: ConfigObject,
  conceptMetadata: Array<ConceptMetadata>,
): Array<ObservationInterpretation> {
  return Object.entries(vitals).map((key, value) => {
    return assessValue(value, getReferenceRangesForConcept(config.concepts[`${key[0]}Uuid`], conceptMetadata));
  });
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
