import useSWR from 'swr';
import { PatientVitalsAndBiometrics } from './vitals-biometrics-form/vitals-biometrics-form.component';
import { openmrsFetch, fhirBaseUrl, useConfig, FHIRResource, parseDate } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';
import { calculateBMI } from './vitals-biometrics-form/vitals-biometrics-form.utils';

export const pageSize = 100;

export interface PatientVitals {
  id: string;
  date: string;
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  temperature?: number;
  oxygenSaturation?: number;
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

interface ObsRecord {
  concept: string;
  value: string | number;
}

export function useVitals(patientUuid: string, includeBiometrics: boolean = false) {
  const { concepts } = useConfig();
  const biometricsConcepts = [concepts.heightUuid, concepts.midUpperArmCircumferenceUuid, concepts.weightUuid];

  const conceptUuids = includeBiometrics
    ? Object.values(concepts).join(',')
    : Object.values(concepts)
        .filter((uuid) => !biometricsConcepts.includes(uuid))
        .join(',');

  const { data, error, isValidating } = useSWR<{ data: VitalsFetchResponse }, Error>(
    `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&code=` +
      conceptUuids +
      '&_summary=data&_sort=-date' +
      `&_count=${pageSize}
    `,
    openmrsFetch,
  );

  const getVitalSignKey = (conceptUuid: string) => {
    if (conceptUuid === concepts.systolicBloodPressureUuid) return 'systolic';
    if (conceptUuid === concepts.diastolicBloodPressureUuid) return 'diastolic';
    if (conceptUuid === concepts.pulseUuid) return 'pulse';
    if (conceptUuid === concepts.temperatureUuid) return 'temperature';
    if (conceptUuid === concepts.oxygenSaturationUuid) return 'oxygenSaturation';
    if (conceptUuid === concepts.respiratoryRateUuid) return 'respiratoryRate';
    if (conceptUuid === concepts.heightUuid) return 'height';
    if (conceptUuid === concepts.weightUuid) return 'weight';
    if (conceptUuid === concepts.midUpperArmCircumferenceUuid) return 'muac';
    return;
  };

  const formattedVitals = () => {
    const vitalsHashTable = new Map<string, Partial<PatientVitals>>([]);
    data?.data?.entry?.map(({ resource }) => {
      const issuedDate = new Date(new Date(resource.issued).setSeconds(0, 0)).toISOString();
      if (vitalsHashTable.has(issuedDate) && vitalsHashTable.get(issuedDate)) {
        vitalsHashTable.set(issuedDate, {
          ...vitalsHashTable.get(issuedDate),
          [getVitalSignKey(resource.code.coding[0].code)]: resource?.valueQuantity?.value,
        });
      } else {
        resource?.valueQuantity?.value &&
          vitalsHashTable.set(issuedDate, {
            [getVitalSignKey(resource.code.coding[0].code)]: resource?.valueQuantity?.value,
          });
      }
    });

    return Array.from(vitalsHashTable).map(([date, vital], index) => {
      return {
        ...vital,
        date: date,
        id: index.toString(),
        bmi: calculateBMI(vital.weight, vital.height),
      };
    });
  };

  return {
    vitals: formattedVitals() as Array<PatientVitals>,
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
