import { openmrsFetch } from "@openmrs/esm-api";

export function getAppointments(
  patientUuid: string,
  startDate: string,
  abortController: AbortController
) {
  return openmrsFetch(`/ws/rest/v1/appointments/search`, {
    method: "POST",
    signal: abortController.signal,
    headers: {
      "Content-Type": "application/json"
    },
    body: {
      patientUuid: patientUuid,
      startDate: startDate
    }
  });
}
