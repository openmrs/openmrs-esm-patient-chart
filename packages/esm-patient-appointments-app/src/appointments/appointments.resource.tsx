import dayjs from 'dayjs';
import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { AppointmentPayload, AppointmentService, AppointmentsFetchResponse } from '../types';
import isToday from 'dayjs/plugin/isToday';
dayjs.extend(isToday);

export const appointmentsSearchUrl = `/ws/rest/v1/appointments/search`;

export function useAppointments(patientUuid: string, startDate: string, abortController: AbortController) {
  /* 
    SWR isn't meant to make POST requests for data fetching. This is a consequence of the API only exposing this resource via POST.
    This works but likely isn't recommended.
  */
  const fetcher = () =>
    openmrsFetch(appointmentsSearchUrl, {
      method: 'POST',
      signal: abortController.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        patientUuid: patientUuid,
        startDate: startDate,
      },
    });

  const { data, error, isValidating } = useSWR<AppointmentsFetchResponse, Error>(appointmentsSearchUrl, fetcher);

  const appointments = data?.data?.length
    ? data.data.sort((a, b) => (b.startDateTime > a.startDateTime ? 1 : -1))
    : null;

  const pastAppointments = appointments?.filter(({ startDateTime }) =>
    dayjs(new Date(startDateTime).toISOString()).isBefore(new Date().setHours(0, 0, 0, 0)),
  );

  const upcomingAppointments = appointments?.filter(({ startDateTime }) =>
    dayjs(new Date(startDateTime).toISOString()).isAfter(new Date()),
  );

  const todaysAppointments = appointments?.filter(({ startDateTime }) =>
    dayjs(new Date(startDateTime).toISOString()).isToday(),
  );

  return {
    data: data ? { pastAppointments, upcomingAppointments, todaysAppointments } : null,
    isError: error,
    isLoading: !data && !error,
    isValidating,
  };
}

export function useAppointmentService() {
  const { data, error } = useSWR<{ data: Array<AppointmentService> }, Error>(
    `/ws/rest/v1/appointmentService/all/full`,
    openmrsFetch,
  );

  return {
    data: data ? data.data : null,
    isError: error,
    isLoading: !data && !error,
  };
}

export function createAppointment(appointment: AppointmentPayload, abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/appointment`, {
    method: 'POST',
    signal: abortController.signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: appointment,
  });
}

export function getAppointmentsByUuid(appointmentUuid: string, abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/appointments/${appointmentUuid}`, {
    signal: abortController.signal,
  });
}

export function getAppointmentService(abortController: AbortController, uuid) {
  return openmrsFetch(`/ws/rest/v1/appointmentService?uuid=` + uuid, {
    signal: abortController.signal,
  });
}

export function getTimeSlots(abortController: AbortController) {
  //https://openmrs-spa.org/openmrs/ws/rest/v1/appointment/all?forDate=2020-03-02T21:00:00.000Z
}
