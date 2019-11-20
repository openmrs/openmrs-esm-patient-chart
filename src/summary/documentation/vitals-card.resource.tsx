import { openmrsObservableFetch } from "@openmrs/esm-api";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";

const SYSTOLIC_BLOOD_PRESSURE_CONCEPT: string =
  "5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const DIASTOLIC_BLOOD_PRESSURE_CONCEPT: string =
  "5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const PULSE_CONCEPT: string = "5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const TEMPERATURE_CONCEPT: string = "5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const OXYGENATION_CONCEPT: string = "5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

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
  return openmrsObservableFetch(
    `/ws/fhir/Observation?subject:Patient=${patientID}&code=${SYSTOLIC_BLOOD_PRESSURE_CONCEPT},${DIASTOLIC_BLOOD_PRESSURE_CONCEPT},${PULSE_CONCEPT},${TEMPERATURE_CONCEPT},${OXYGENATION_CONCEPT}`
  ).pipe(
    map(({ data }) => data["entry"]),
    map(entries => entries.map(entry => entry.resource)),
    map(data =>
      formatVitals(
        getVitalsByConcept(data, SYSTOLIC_BLOOD_PRESSURE_CONCEPT),
        getVitalsByConcept(data, DIASTOLIC_BLOOD_PRESSURE_CONCEPT),
        getVitalsByConcept(data, PULSE_CONCEPT),
        getVitalsByConcept(data, TEMPERATURE_CONCEPT),
        getVitalsByConcept(data, OXYGENATION_CONCEPT)
      )
    ),
    take(3)
  );
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
