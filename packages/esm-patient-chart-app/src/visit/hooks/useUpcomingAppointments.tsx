import dayjs from 'dayjs';
import { openmrsFetch, restBaseUrl, type OpenmrsResource } from '@openmrs/esm-framework';
import { omrsDateFormat } from '../../constants';

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

export const updateAppointmentStatus = async (toStatus: string, appointmentUuid: string) => {
  const abortController = new AbortController();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const statusChangeTime = dayjs(new Date()).format(omrsDateFormat);
  const url = `${restBaseUrl}/appointments/${appointmentUuid}/status-change`;
  return await openmrsFetch(url, {
    body: { toStatus, onDate: statusChangeTime, timeZone: timeZone },
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: abortController.signal,
  });
};
