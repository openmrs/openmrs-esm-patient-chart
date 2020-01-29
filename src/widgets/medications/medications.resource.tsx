import { openmrsObservableFetch } from "@openmrs/esm-api";
import { Observable } from "rxjs";
import { map, take, filter } from "rxjs/operators";

type PatientMedications = {
  uuid: Number;
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

export function fetchPatientMedications(
  patientID: string
): Observable<PatientMedications[]> {
  return openmrsObservableFetch(
    `/ws/rest/v1/order?patient=${patientID}&careSetting=6f0c9a92-6f24-11e3-af88-005056821db0&status=any&v=full`
  ).pipe(
    map(({ data }) => {
      const meds = [];
      data["results"].map(result => {
        if (result.orderType.name === "Drug Order") {
          meds.push(result);
        }
      });
      return meds;
    })
  );
}
