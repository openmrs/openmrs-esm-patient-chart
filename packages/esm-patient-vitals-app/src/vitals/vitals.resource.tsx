import useSWR from 'swr';
import { PatientVitalsAndBiometrics } from './vitals-biometrics-form/vitals-biometrics-form.component';
import { openmrsFetch, fhirBaseUrl, useConfig, FHIRResource } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';
import { calculateBMI } from './vitals-biometrics-form/vitals-biometrics-form.utils';

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

type Observations = Array<FHIRResource['resource']>;

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

  const filterByConceptUuid = (vitals: Observations, conceptUuid: string) => {
    return vitals.filter((obs) => obs.code.coding.some((c) => c.code === conceptUuid));
  };

  const observations: Observations = data?.data?.entry?.map((entry) => entry.resource) ?? [];

  const formattedObservations =
    data?.data?.total > 0
      ? formatObservations(
          filterByConceptUuid(observations, concepts.systolicBloodPressureUuid),
          filterByConceptUuid(observations, concepts.diastolicBloodPressureUuid),
          filterByConceptUuid(observations, concepts.pulseUuid),
          filterByConceptUuid(observations, concepts.temperatureUuid),
          filterByConceptUuid(observations, concepts.oxygenSaturationUuid),
          filterByConceptUuid(observations, concepts.respiratoryRateUuid),
          filterByConceptUuid(observations, concepts.heightUuid),
          filterByConceptUuid(observations, concepts.weightUuid),
        )
      : null;

  return {
    vitals: formattedObservations,
    isError: error,
    isLoading: !data && !error,
    isValidating,
  };
}

function formatObservations(
  systolicBloodPressure: Observations,
  diastolicBloodPressure: Observations,
  pulseData: Observations,
  temperatureData: Observations,
  oxygenSaturationData: Observations,
  respiratoryRateData: Observations,
  heightData: Observations,
  weightData: Observations,
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
    const height = heightData.find((height) => height.issued === date);
    const weight = weightData.find((weight) => weight.issued === date);
    return {
      id: systolic?.encounter?.reference.replace('Encounter/', ''),
      date: systolic?.issued || diastolic?.issued || pulse?.issued,
      systolic: systolic?.valueQuantity?.value,
      diastolic: diastolic?.valueQuantity?.value,
      pulse: pulse?.valueQuantity?.value,
      temperature: temperature?.valueQuantity?.value,
      oxygenSaturation: oxygenSaturation?.valueQuantity?.value,
      respiratoryRate: respiratoryRate?.valueQuantity?.value,
      height: height?.valueQuantity?.value,
      weight: weight?.valueQuantity?.value,
      bmi:
        height?.valueQuantity?.value && weight?.valueQuantity?.value
          ? calculateBMI(Number(weight?.valueQuantity?.value), Number(height?.valueQuantity?.value))
          : null,
    };
  });
}

function getDatesIssued(vitalsArray: Observations): Array<Date> {
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
