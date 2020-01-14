import { openmrsObservableFetch, openmrsFetch } from "@openmrs/esm-api";
import { Observable, of } from "rxjs";
import { map, take } from "rxjs/operators";
import { Vitals } from "./vitals-form.component";

const SYSTOLIC_BLOOD_PRESSURE_CONCEPT: string =
  "5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const DIASTOLIC_BLOOD_PRESSURE_CONCEPT: string =
  "5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const PULSE_CONCEPT: string = "5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const TEMPERATURE_CONCEPT: string = "5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const OXYGENATION_CONCEPT: string = "5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const HEIGHT_CONCEPT: string = "5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const WEIGHT_CONCEPT: string = "5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

type PatientVitals = {
  id: Number;
  date: Date;
  systolic: String;
  diastolic: String;
  pulse: String;
  temperature: String;
  oxygenation: String;
};

export function performPatientsVitalsSearch(
  patientID: string
): Observable<PatientVitals[]> {
  // return openmrsObservableFetch(
  //   `/ws/fhir/Observation?subject:Patient=${patientID}&code=${SYSTOLIC_BLOOD_PRESSURE_CONCEPT},${DIASTOLIC_BLOOD_PRESSURE_CONCEPT},${PULSE_CONCEPT},${TEMPERATURE_CONCEPT},${OXYGENATION_CONCEPT}`
  // ).pipe(
  //   map(({ data }) => data["entry"]),
  //   map(entries => entries.map(entry => entry.resource)),
  //   map(data =>
  //     formatVitals(
  //       getVitalsByConcept(data, SYSTOLIC_BLOOD_PRESSURE_CONCEPT),
  //       getVitalsByConcept(data, DIASTOLIC_BLOOD_PRESSURE_CONCEPT),
  //       getVitalsByConcept(data, PULSE_CONCEPT),
  //       getVitalsByConcept(data, TEMPERATURE_CONCEPT),
  //       getVitalsByConcept(data, OXYGENATION_CONCEPT)
  //     )
  //   ),
  //   take(3)
  // );
  return of([]);
}

function getVitalsByConcept(vitals: any[], concept: string) {
  const vitalArray: any[] = [];
  vitals.map(vital =>
    vital.code.coding.map(
      coding => coding.code === concept && vitalArray.push(vital)
    )
  );
  return vitalArray;
}

function formatVitals(
  systolicBloodPressure,
  diastolicBloodPressure,
  pulseData,
  temperatureData,
  oxygenationData
): PatientVitals[] {
  let patientVitals: PatientVitals;
  const systolicDates = getDatesIssued(systolicBloodPressure);
  const diastolicDates = getDatesIssued(systolicBloodPressure);

  const uniqueDates = Array.from(
    new Set(systolicDates.concat(diastolicDates))
  ).sort(latestFirst);

  return uniqueDates.map(date => {
    const systolic = systolicBloodPressure.find(
      systolic => systolic.issued === date
    );
    const diastolic = diastolicBloodPressure.find(
      diastolic => diastolic.issued === date
    );
    const pulse = pulseData.find(pulse => pulse.issued === date);
    const temperature = temperatureData.find(
      temperature => temperature.issued === date
    );
    const oxygenation = oxygenationData.find(
      oxygenation => oxygenation.issued === date
    );

    return (patientVitals = {
      id: new Date(date).getTime(),
      date: systolic && systolic.issued,
      systolic: systolic && systolic.valueQuantity.value,
      diastolic: diastolic && diastolic.valueQuantity.value,
      pulse: pulse && pulse.valueQuantity.value,
      temperature: temperature && temperature.valueQuantity.value,
      oxygenation: oxygenation && oxygenation.valueQuantity.value
    });
  });
}

function getDatesIssued(vitalsArray): string[] {
  return vitalsArray.map(vitals => vitals.issued);
}

function latestFirst(a, b) {
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
  patientUuid: string,
  vitals: Vitals,
  encounterDatetime: Date,
  abortController: AbortController,
  encounterProvider: string
) {
  return openmrsFetch(`/ws/rest/v1/encounter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    signal: abortController.signal,
    body: {
      encounterDatetime: encounterDatetime,
      encounterProviders: [
        {
          provider: "f9badd80-ab76-11e2-9e96-0800200c9a66",
          encounterRole: "240b26f9-dd88-4172-823d-4a8bfeb7841f"
        }
      ],
      location: "b1a8b05e-3542-4037-bbd3-998ee9c40574",
      patient: patientUuid,
      encounterType: "67a71486-1a54-468f-ac3e-7091a9a79584",
      form: "a000cb34-9ec1-4344-a1c8-f692232f6edd",
      obs: [
        {
          concept: SYSTOLIC_BLOOD_PRESSURE_CONCEPT,
          value: vitals.systolicBloodPressure
        },
        {
          concept: DIASTOLIC_BLOOD_PRESSURE_CONCEPT,
          value: vitals.diastolicBloodPressure
        },
        {
          concept: PULSE_CONCEPT,
          value: vitals.heartRate
        },
        {
          concept: OXYGENATION_CONCEPT,
          value: vitals.oxygenSaturation
        },
        {
          concept: TEMPERATURE_CONCEPT,
          value: vitals.temperature
        },
        {
          concept: WEIGHT_CONCEPT,
          value: vitals.weight
        },
        {
          concept: HEIGHT_CONCEPT,
          value: vitals.height
        }
      ],
      orders: []
    }
  });
}

export function editPatientVitals(
  patientUuid: string,
  vitals: Vitals,
  encounterDatetime: Date,
  abortController: AbortController,
  encounterUuid: string,
  encounterProvider: string
) {
  return openmrsFetch(`/ws/rest/v1/encounter/${encounterUuid}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    signal: abortController.signal,
    body: {
      encounterDatetime: encounterDatetime,
      encounterProviders: [
        {
          provider: encounterProvider,
          encounterRole: "240b26f9-dd88-4172-823d-4a8bfeb7841f"
        }
      ],
      location: "b1a8b05e-3542-4037-bbd3-998ee9c40574",
      patient: patientUuid,
      encounterType: "67a71486-1a54-468f-ac3e-7091a9a79584",
      form: "a000cb34-9ec1-4344-a1c8-f692232f6edd",
      uuid: encounterUuid,
      obs: vitals,
      orders: []
    }
  });
}

export function getSession() {
  return openmrsFetch(`/ws/rest/v1/appui/session`);
}
