import {
  openmrsObservableFetch,
  openmrsFetch,
  fhirBaseUrl,
  FHIRResource,
} from "@openmrs/esm-framework";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { PatientVitalAndBiometric } from "./vitals-biometrics-form/vitals-biometrics-form.component";
import { calculateBMI } from "./vitals-biometrics-form/vitals-biometrics-form.utils";
import { ConfigObject } from "../config-schema";

export interface PatientVitals {
  id: string;
  date: Date;
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

export function performPatientsVitalsSearch(
  concepts: ConfigObject["concepts"],
  patientID: string,
  pageSize: number = 100
): Observable<Array<PatientVitals>> {
  const vitalsConcepts = {
    systolicBloodPressure: concepts.systolicBloodPressureUuid,
    diastolicBloodPressure: concepts.diastolicBloodPressureUuid,
    pulse: concepts.pulseUuid,
    temperature: concepts.temperatureUuid,
    oxygenSaturation: concepts.oxygenSaturationUuid,
    height: concepts.heightUuid,
    weight: concepts.weightUuid,
    respiratoryRate: concepts.respiratoryRateUuid,
  };

  function filterByConceptUuid(vitals, conceptUuid) {
    return vitals.filter((obs) =>
      obs.code.coding.some((c) => c.code === conceptUuid)
    );
  }

  return openmrsObservableFetch<VitalsFetchResponse>(
    `${fhirBaseUrl}/Observation?subject:Patient=${patientID}&code=` +
      Object.values(vitalsConcepts).join(",") +
      "&_summary=data&_sort=-date" +
      `&_count=${pageSize}`
  ).pipe(
    map(({ data }) => {
      return data.entry;
    }),
    map((entries) => entries?.map((entry) => entry.resource) ?? []),
    map((vitals) => {
      return formatVitals(
        filterByConceptUuid(vitals, concepts.systolicBloodPressureUuid),
        filterByConceptUuid(vitals, concepts.diastolicBloodPressureUuid),
        filterByConceptUuid(vitals, concepts.pulseUuid),
        filterByConceptUuid(vitals, concepts.temperatureUuid),
        filterByConceptUuid(vitals, concepts.oxygenSaturationUuid),
        filterByConceptUuid(vitals, concepts.heightUuid),
        filterByConceptUuid(vitals, concepts.weightUuid),
        filterByConceptUuid(vitals, concepts.respiratoryRateUuid)
      );
    })
  );
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
  respiratoryRateData: Vitals
): Array<PatientVitals> {
  let patientVitals: PatientVitals;
  const systolicDates = getDatesIssued(systolicBloodPressure);
  const diastolicDates = getDatesIssued(diastolicBloodPressure);

  const uniqueDates = Array.from(
    new Set(systolicDates?.concat(diastolicDates))
  ).sort(latestFirst);

  return uniqueDates.map((date) => {
    const systolic = systolicBloodPressure.find(
      (systolic) => systolic.issued === date
    );
    const diastolic = diastolicBloodPressure.find(
      (diastolic) => diastolic.issued === date
    );
    const pulse = pulseData.find((pulse) => pulse.issued === date);
    const temperature = temperatureData.find(
      (temperature) => temperature.issued === date
    );
    const oxygenSaturation = oxygenSaturationData.find(
      (oxygenSaturation) => oxygenSaturation.issued === date
    );
    const height = heightData.find((height) => height.issued === date);
    const weight = weightData.find((weight) => weight.issued === date);
    const respiratoryRate = respiratoryRateData.find(
      (respiratoryRate) => respiratoryRate.issued === date
    );
    return (patientVitals = {
      id: systolic?.encounter?.reference.replace("Encounter/", ""),
      date: systolic?.issued,
      systolic: systolic?.valueQuantity?.value,
      diastolic: diastolic?.valueQuantity?.value,
      pulse: pulse?.valueQuantity?.value,
      temperature: temperature?.valueQuantity?.value,
      oxygenSaturation: oxygenSaturation?.valueQuantity?.value,
      weight: weight?.valueQuantity?.value,
      height: height?.valueQuantity?.value,
      bmi:
        weight && height
          ? calculateBMI(weight.valueQuantity.value, height.valueQuantity.value)
          : null,
      respiratoryRate: respiratoryRate?.valueQuantity?.value,
    });
  });
}

function getDatesIssued(vitalsArray: Vitals): Array<Date> {
  return vitalsArray.map((vitals) => vitals.issued);
}

function latestFirst(a: Date, b: Date) {
  return new Date(b).getTime() - new Date(a).getTime();
}

export function getPatientsLatestVitals(
  patientUuuid: string,
  abortController: AbortController
) {
  return openmrsFetch(
    `/ws/rest/v1/encounter?patient=${patientUuuid}&v=custom:(uuid,encounterDatetime,obs:(uuid,value))`,
    { signal: abortController.signal }
  );
}

export function savePatientVitals(
  encounterTypeUuid: string,
  formUuid: string,
  concepts: ConfigObject["concepts"],
  patientUuid: string,
  vitals: PatientVitalAndBiometric,
  encounterDatetime: Date,
  abortController: AbortController,
  location: string
) {
  return openmrsFetch(`/ws/rest/v1/encounter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

function createObsObject(
  vitals: PatientVitalAndBiometric,
  concepts: ConfigObject["concepts"]
): Array<ObsRecord> {
  return Object.entries(vitals)
    .filter(([_, result]) => result != null)
    .map(([name, result]) => {
      return {
        concept: concepts[name + "Uuid"],
        value: result,
      };
    });
}

export function editPatientVitals(
  concepts: ConfigObject["concepts"],
  patientUuid: string,
  vitals: PatientVitalAndBiometric,
  encounterDatetime: Date,
  abortController: AbortController,
  encounterUuid: string,
  location: string
) {
  return openmrsFetch(`/ws/rest/v1/encounter/${encounterUuid}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

export function getSession(abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/appui/session`, {
    signal: abortController.signal,
  });
}

interface VitalsFetchResponse {
  entry: Array<FHIRResource>;
  id: string;
  resourceType: string;
  total: number;
  type: string;
}

interface ObsRecord {
  concept: string;
  value: string | number;
}
