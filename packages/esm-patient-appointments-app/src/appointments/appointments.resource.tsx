import { openmrsFetch } from "@openmrs/esm-framework";
import { Appointment } from "./appointments-form.component";

export function createAppointment(
  appointment: Appointment,
  abortController: AbortController
) {
  return openmrsFetch(`/ws/rest/v1/appointment`, {
    method: "POST",
    signal: abortController.signal,
    headers: {
      "Content-Type": "application/json"
    },
    body: appointment
  });
}

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

export function getAppointmentsByUuid(
  appointmentUuid: string,
  abortController: AbortController
) {
  return openmrsFetch(`/ws/rest/v1/appointments/${appointmentUuid}`, {
    signal: abortController.signal
  });
}

export function getAppointmentServiceAll(abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/appointmentService/all/full`, {
    signal: abortController.signal
  });
}
export function getAppointmentService(abortController: AbortController, uuid) {
  return openmrsFetch(`/ws/rest/v1/appointmentService?uuid=` + uuid, {
    signal: abortController.signal
  });
}

export function getTimeSlots(abortController: AbortController) {
  //https://openmrs-spa.org/openmrs/ws/rest/v1/appointment/all?forDate=2020-03-02T21:00:00.000Z
}

export function getSession(abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/appui/session`, {
    signal: abortController.signal
  });
}
