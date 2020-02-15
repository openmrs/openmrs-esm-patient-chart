import { openmrsObservableFetch } from "@openmrs/esm-api";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";

export function fetchPatientPrograms(
  patientID: string
): Observable<PatientProgram[]> {
  return openmrsObservableFetch(
    `/ws/rest/v1/programenrollment?patient=${patientID}`
  ).pipe(
    map(({ data }) => data["results"]),
    take(3)
  );
}

export function getPatientProgramByUuid(
  programUuid: string
): Observable<PatientProgram> {
  return openmrsObservableFetch(
    `/ws/rest/v1/programenrollment/${programUuid}`
  ).pipe(map(({ data }) => mapToPatientProgram(data)));
}

function mapToPatientProgram(data: any): PatientProgram {
  return {
    uuid: data.uuid,
    program: data.program,
    display: data.display,
    dateEnrolled: data.dateEnrolled,
    dateCompleted: data.dateCompleted,
    links: data.links
  };
}

type PatientProgram = {
  uuid: String;
  program: {};
  display: String;
  dateEnrolled: Date;
  dateCompleted: Date;
  links: [];
};
