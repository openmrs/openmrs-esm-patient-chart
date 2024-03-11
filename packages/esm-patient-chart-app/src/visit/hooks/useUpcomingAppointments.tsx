import dayjs from 'dayjs';
import { openmrsFetch, restBaseUrl, type OpenmrsResource } from '@openmrs/esm-framework';

export interface AppointmentPayload {
  patientUuid: string;
  serviceUuid: string;
  startDateTime: string;
  endDateTime: string;
  appointmentKind: string;
  providers?: Array<OpenmrsResource>;
  locationUuid: string;
  comments?: string;
  status?: string;
  appointmentNumber?: string;
  uuid?: string;
  providerUuid?: string | OpenmrsResource;
  dateHonored?: string;
}

export function saveAppointment(appointment: AppointmentPayload, abortController: AbortController) {
  return openmrsFetch(`${restBaseUrl}/appointment`, {
    method: 'POST',
    signal: abortController.signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: appointment,
  });
}
