import { openmrsObservableFetch } from "@openmrs/esm-api";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";

export function fetchPatientPrograms(
  patientID: string
): Observable<PatientPrograms[]> {
  return openmrsObservableFetch(
    `/ws/rest/v1/programenrollment?patient=${patientID}`
  ).pipe(
    map(({ data }) => data["results"]),
    take(3)
  );
}

type PatientPrograms = {
  uuid: String;
  program: {};
  display: String;
  dateEnrolled: Date;
  dateCompleted: Date;
  links: [];
};
