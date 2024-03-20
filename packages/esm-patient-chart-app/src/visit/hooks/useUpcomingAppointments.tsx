import dayjs from 'dayjs';
import { openmrsFetch, restBaseUrl, type OpenmrsResource, useAbortController } from '@openmrs/esm-framework';
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

export const updateAppointmentStatus = async (
  toStatus: string,
  appointmentUuid: string,
  abortController: AbortController,
) => {
  const statusChangeTime = dayjs().format(omrsDateFormat);
  const url = `${restBaseUrl}/appointments/${appointmentUuid}/status-change`;
  return await openmrsFetch(url, {
    body: { toStatus, onDate: statusChangeTime },
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: abortController.signal,
  });
};
