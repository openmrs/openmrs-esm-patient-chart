import { openmrsObservableFetch } from "@openmrs/esm-api";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";

type PatientMedications = {
  id: Number;
  date: Date;
  systolic: String;
  diastolic: String;
  pulse: String;
  temperature: String;
  oxygenation: String;
};

export function performPatientMedicationsSearch(
  patientID: string
): Observable<PatientMedications[]> {
  return openmrsObservableFetch(
    `/ws/fhir/MedicationRequest?patient=${patientID}`
  ).pipe(
    map(({ data }) => data["entry"]),
    map(entries => entries.map(entry => entry.resource)),
    take(3)
  );
}
