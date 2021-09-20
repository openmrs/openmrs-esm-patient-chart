import useSWR from 'swr';
import { PatientVitalAndBiometric } from './vitals-biometrics-form/vitals-biometrics-form.component';
import { openmrsFetch, fhirBaseUrl, useConfig } from '@openmrs/esm-framework';
import { calculateBMI } from './vitals-biometrics-form/vitals-biometrics-form.utils';
import { ConfigObject } from '../config-schema';

export const pageSize = 100;

export function useVitals(patientUuid: string) {
  const config = useConfig();
  const vitalsConcepts = {
    systolicBloodPressure: config.concepts.systolicBloodPressureUuid,
    diastolicBloodPressure: config.concepts.diastolicBloodPressureUuid,
    pulse: config.concepts.pulseUuid,
    temperature: config.concepts.temperatureUuid,
    oxygenSaturation: config.concepts.oxygenSaturationUuid,
    height: config.concepts.heightUuid,
    weight: config.concepts.weightUuid,
    respiratoryRate: config.concepts.respiratoryRateUuid,
  };

  const { data, error, isValidating } = useSWR<{ data: VitalsFetchResponse }, Error>(
    `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&code=` +
      Object.values(vitalsConcepts).join(',') +
      '&_summary=data&_sort=-date' +
      `&_count=${pageSize}
  `,
    openmrsFetch,
  );

  const observations = data?.data?.total > 0 ? data.data?.entry?.map((entry) => entry.resource ?? []) : null;

  const systolicBloodPressureData = observations?.filter((obs) =>
    obs.code.coding.some((sys) => sys.code === config.concepts.systolicBloodPressureUuid),
  );
  const diastolicBloodPressureData = observations?.filter((obs) =>
    obs.code.coding.some((sys) => sys.code === config.concepts.diastolicBloodPressureUuid),
  );
  const pulseData = observations?.filter((obs) =>
    obs.code.coding.some((sys) => sys.code === config.concepts.pulseUuid),
  );
  const temperatureData = observations?.filter((obs) =>
    obs.code.coding.some((sys) => sys.code === config.concepts.temperatureUuid),
  );
  const oxygenSaturationData = observations?.filter((obs) =>
    obs.code.coding.some((sys) => sys.code === config.concepts.oxygenSaturationUuid),
  );
  const heightData = observations?.filter((obs) =>
    obs.code.coding.some((sys) => sys.code === config.concepts.heightUuid),
  );
  const weightData = observations?.filter((obs) =>
    obs.code.coding.some((sys) => sys.code === config.concepts.weightUuid),
  );
  const respiratoryRateData = observations?.filter((obs) =>
    obs.code.coding.some((sys) => sys.code === config.concepts.respiratoryRateUuid),
  );

  return {
    data:
      data?.data?.total > 0
        ? formatVitals(
            systolicBloodPressureData,
            diastolicBloodPressureData,
            pulseData,
            temperatureData,
            oxygenSaturationData,
            heightData,
            weightData,
            respiratoryRateData,
          )
        : null,
    isError: error,
    isLoading: !data && !error,
    isValidating,
  };
}

type Vitals = Array<{ issued: Date; valueQuantity: any; encounter: any }>;

function formatVitals(
  systolicBloodPressure: Vitals,
  diastolicBloodPressure: Vitals,
  pulseData: Vitals,
  temperatureData: Vitals,
  oxygenSaturationData: Vitals,
  heightData: Vitals,
  weightData: Vitals,
  respiratoryRateData: Vitals,
): Array<PatientVitals> {
  const systolicDates = getDatesIssued(systolicBloodPressure);
  const diastolicDates = getDatesIssued(diastolicBloodPressure);

  const uniqueDates = Array.from(new Set(systolicDates?.concat(diastolicDates))).sort(latestFirst);

  return uniqueDates.map((date) => {
    const systolic = systolicBloodPressure.find((systolic) => systolic.issued === date);
    const diastolic = diastolicBloodPressure.find((diastolic) => diastolic.issued === date);
    const pulse = pulseData.find((pulse) => pulse.issued === date);
    const temperature = temperatureData.find((temperature) => temperature.issued === date);
    const oxygenSaturation = oxygenSaturationData.find((oxygenSaturation) => oxygenSaturation.issued === date);
    const height = heightData.find((height) => height.issued === date);
    const weight = weightData.find((weight) => weight.issued === date);
    const respiratoryRate = respiratoryRateData.find((respiratoryRate) => respiratoryRate.issued === date);
    return {
      id: systolic?.encounter?.reference.replace('Encounter/', ''),
      date: systolic?.issued,
      systolic: systolic?.valueQuantity?.value,
      diastolic: diastolic?.valueQuantity?.value,
      pulse: pulse?.valueQuantity?.value,
      temperature: temperature?.valueQuantity?.value,
      oxygenSaturation: oxygenSaturation?.valueQuantity?.value,
      weight: weight?.valueQuantity?.value,
      height: height?.valueQuantity?.value,
      bmi: weight && height ? calculateBMI(weight.valueQuantity.value, height.valueQuantity.value) : null,
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
  vitals: PatientVitalAndBiometric,
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

function createObsObject(vitals: PatientVitalAndBiometric, concepts: ConfigObject['concepts']): Array<ObsRecord> {
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
  vitals: PatientVitalAndBiometric,
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

export interface PatientVitals {
  id: string;
  date: Date | string;
  systolic?: string;
  diastolic?: string;
  pulse?: string;
  temperature?: string;
  oxygenSaturation?: string;
  height?: string;
  weight?: string;
  bmi?: any;
  respiratoryRate?: string;
}

interface VitalsFetchResponse {
  entry: Array<{
    resource: any;
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
