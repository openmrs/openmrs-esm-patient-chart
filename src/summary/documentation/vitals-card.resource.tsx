import { openmrsObservableFetch } from "@openmrs/esm-api";
import { forkJoin } from "rxjs";
import { map, take } from "rxjs/operators";

const SYSTOLIC_BLOOD_PRESSURE_CONCEPT = "5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const DIASTOLIC_BLOOD_PRESSURE_CONCEPT = "5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const PULSE_CONCEPT = "5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const TEMPERATURE_CONCEPT = "5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const OXYGENATION_CONCEPT = "5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export function performPatientsVitalsSearch(patientId: string) {
  return forkJoin({
    systoliBloodPressure: getVitals(patientId, SYSTOLIC_BLOOD_PRESSURE_CONCEPT),
    diastolicBloodPressure: getVitals(
      patientId,
      DIASTOLIC_BLOOD_PRESSURE_CONCEPT
    ),
    pulse: getVitals(patientId, PULSE_CONCEPT),
    temperature: getVitals(patientId, TEMPERATURE_CONCEPT),
    oxygenation: getVitals(patientId, OXYGENATION_CONCEPT)
  }).pipe(
    map(data =>
      formatVitals(
        data.systoliBloodPressure,
        data.diastolicBloodPressure,
        data.pulse,
        data.temperature,
        data.oxygenation
      )
    ),
    take(3)
  );
}

function getVitals(patientId: string, concept) {
  return openmrsObservableFetch(
    `/ws/fhir/Observation?subject:Patient=${patientId}&code=${concept}`
  ).pipe(
    map(({ data }) => data["entry"]),
    map(entries => entries.map(entry => entry.resource))
  );
}

function formatVitals(
  systolicBloodPressure,
  diastolicBloodPressure,
  pulseData,
  temperatureData,
  oxygenationData
) {
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

    return {
      id: new Date(date).getTime(),
      date: systolic ? systolic.issued : systolic,
      systolic: systolic ? systolic.valueQuantity.value : systolic,
      diastolic: diastolic ? diastolic.valueQuantity.value : diastolic,
      pulse: pulse ? pulse.valueQuantity.value : pulse,
      temperature: temperature ? temperature.valueQuantity.value : temperature,
      oxygenation: oxygenation ? oxygenation.valueQuantity.value : oxygenation
    };
  });
}

function getDatesIssued(vitalsArray): string[] {
  return vitalsArray.map(vitals => vitals.issued);
}

function latestFirst(a, b) {
  return new Date(b).getTime() - new Date(a).getTime();
}
