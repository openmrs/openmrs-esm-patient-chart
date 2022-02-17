import useSWR from 'swr';
import { PatientVitalsAndBiometrics } from './vitals-biometrics-form/vitals-biometrics-form.component';
import { openmrsFetch, fhirBaseUrl, useConfig, FHIRResource } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';

export const pageSize = 100;

export interface PatientVitals {
  id: string;
  date: Date;
  systolic?: number;
  systolicRange?: any;
  diastolic?: number;
  pulse?: number;
  temperature?: number;
  oxygenSaturation?: number;
  height?: number;
  weight?: number;
  bmi?: number | null;
  respiratoryRate?: number;
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

type Vitals = Array<FHIRResource['resource']>;

export function useVitals(patientUuid: string) {
  const { concepts } = useConfig();

  const { data, error, isValidating } = useSWR<{ data: VitalsFetchResponse }, Error>(
    `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&code=` +
      Object.values(concepts).join(',') +
      '&_summary=data&_sort=-date' +
      `&_count=${pageSize}
  `,
    openmrsFetch,
  );

  const filterByConceptUuid = (vitals: Vitals, conceptUuid: string) => {
    return vitals.filter((obs) => obs.code.coding.some((c) => c.code === conceptUuid));
  };

  const observations: Vitals = data?.data?.entry?.map((entry) => entry.resource) ?? [];

  return {
    vitals:
      data?.data?.total > 0
        ? formatVitals(
            filterByConceptUuid(observations, concepts.systolicBloodPressureUuid),
            filterByConceptUuid(observations, concepts.diastolicBloodPressureUuid),
            filterByConceptUuid(observations, concepts.pulseUuid),
            filterByConceptUuid(observations, concepts.temperatureUuid),
            filterByConceptUuid(observations, concepts.oxygenSaturationUuid),
            filterByConceptUuid(observations, concepts.respiratoryRateUuid),
          )
        : null,
    isError: error,
    isLoading: !data && !error,
    isValidating,
  };
}

function formatVitals(
  systolicBloodPressure: Vitals,
  diastolicBloodPressure: Vitals,
  pulseData: Vitals,
  temperatureData: Vitals,
  oxygenSaturationData: Vitals,
  respiratoryRateData: Vitals,
): Array<PatientVitals> {
  const systolicDates = getDatesIssued(systolicBloodPressure);
  const diastolicDates = getDatesIssued(diastolicBloodPressure);
  const uniqueDates = Array.from(new Set(systolicDates?.concat(diastolicDates))).sort(latestFirst);

  return uniqueDates.map((date: Date) => {
    const systolic = systolicBloodPressure.find((systolic) => systolic.issued === date);
    const diastolic = diastolicBloodPressure.find((diastolic) => diastolic.issued === date);
    const pulse = pulseData.find((pulse) => pulse.issued === date);
    const temperature = temperatureData.find((temperature) => temperature.issued === date);
    const oxygenSaturation = oxygenSaturationData.find((oxygenSaturation) => oxygenSaturation.issued === date);
    const respiratoryRate = respiratoryRateData.find((respiratoryRate) => respiratoryRate.issued === date);
    return {
      id: systolic?.encounter?.reference.replace('Encounter/', ''),
      date: systolic?.issued,
      systolic: systolic?.valueQuantity?.value,
      diastolic: diastolic?.valueQuantity?.value,
      pulse: pulse?.valueQuantity?.value,
      temperature: temperature?.valueQuantity?.value,
      oxygenSaturation: oxygenSaturation?.valueQuantity?.value,
      respiratoryRate: respiratoryRate?.valueQuantity?.value,
    };
  });
}

function getDatesIssued(vitalsArray: Vitals): Array<Date> {
  return vitalsArray.map((vitals) => vitals.issued);
}

function latestFirst(a: Date, b: Date) {
  return new Date(b).getTime() - new Date(a).getTime();
}

export function getPatientsLatestVitals(patientUuuid: string, abortController: AbortController) {
  return openmrsFetch(
    `/ws/rest/v1/encounter?patient=${patientUuuid}&v=custom:(uuid,encounterDatetime,obs:(uuid,value))`,
    { signal: abortController.signal },
  );
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
