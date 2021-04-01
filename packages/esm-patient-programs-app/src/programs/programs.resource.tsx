import { openmrsObservableFetch, openmrsFetch } from "@openmrs/esm-framework";
import { map } from "rxjs/operators";
import { PatientProgram, Program, LocationData, SessionData } from "../types";

export function fetchEnrolledPrograms(patientID: string) {
  return openmrsObservableFetch<PatientProgram>(
    `/ws/rest/v1/programenrollment?patient=${patientID}`
  ).pipe(
    map(({ data }) =>
      data["results"].sort((a, b) => (b.dateEnrolled > a.dateEnrolled ? 1 : -1))
    )
  );
}

export function fetchActiveEnrollments(patientID: string) {
  return openmrsObservableFetch<Array<PatientProgram>>(
    `/ws/rest/v1/programenrollment?patient=${patientID}`
  ).pipe(
    map(({ data }) =>
      data["results"]
        .filter(res => !res.dateCompleted)
        .sort((a, b) => (b.dateEnrolled > a.dateEnrolled ? 1 : -1))
    )
  );
}

export function getPatientProgramByUuid(programUuid: string) {
  return openmrsObservableFetch<PatientProgram>(
    `/ws/rest/v1/programenrollment/${programUuid}`
  ).pipe(map(({ data }) => data));
}

export function createProgramEnrollment(payload, abortController) {
  if (!payload) {
    return null;
  }
  const { program, patient, dateEnrolled, dateCompleted, location } = payload;
  return openmrsObservableFetch(`/ws/rest/v1/programenrollment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: { program, patient, dateEnrolled, dateCompleted, location },
    signal: abortController.signal
  });
}

export function updateProgramEnrollment(payload, abortController) {
  if (!payload && !payload.program) {
    return null;
  }
  const { program, dateEnrolled, dateCompleted, location } = payload;
  return openmrsObservableFetch(`/ws/rest/v1/programenrollment/${program}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: { dateEnrolled, dateCompleted, location },
    signal: abortController.signal
  });
}

export function fetchPrograms() {
  return openmrsObservableFetch<Array<Program>>(
    `/ws/rest/v1/program?v=custom:(uuid,display,allWorkflows,concept:(uuid,display))`
  ).pipe(map(({ data }) => data["results"]));
}

export function fetchLocations() {
  return openmrsObservableFetch<Array<LocationData>>(
    `/ws/rest/v1/location?v=custom:(uuid,display)`
  ).pipe(map(({ data }) => data["results"]));
}

export function getSession(abortController: AbortController) {
  return openmrsFetch<SessionData>(`/ws/rest/v1/appui/session`, {
    signal: abortController.signal
  });
}
