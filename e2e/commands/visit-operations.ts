import { type APIRequestContext, expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import dayjs from 'dayjs';

export const visitStartDatetime = dayjs().subtract(1, 'D');

export const startVisit = async (api: APIRequestContext, patientId: string): Promise<Visit> => {
  const visitRes = await api.post('visit', {
    data: {
      startDatetime: visitStartDatetime.format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
      patient: patientId,
      location: process.env.E2E_LOGIN_DEFAULT_LOCATION_UUID,
      visitType: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
      attributes: [],
    },
  });

  expect(visitRes.ok()).toBeTruthy();
  return await visitRes.json();
};

export const createPastEndedVisit = async (
  api: APIRequestContext,
  patientId: string,
  options: {
    daysAgo?: number;
    durationMinutes?: number;
  } = {},
): Promise<{ visit: Visit; start: dayjs.Dayjs; end: dayjs.Dayjs }> => {
  const daysAgo = options.daysAgo ?? 5;
  const durationMinutes = options.durationMinutes ?? 30;

  const start = dayjs().subtract(daysAgo, 'days');
  const end = start.add(durationMinutes, 'minutes');

  const visitRes = await api.post('visit', {
    data: {
      startDatetime: start.format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
      stopDatetime: end.format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
      patient: patientId,
      location: process.env.E2E_LOGIN_DEFAULT_LOCATION_UUID,
      visitType: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
      attributes: [],
    },
  });

  expect(visitRes.ok()).toBeTruthy();
  const visit = await visitRes.json();
  return { visit, start, end };
};

export const endVisit = async (api: APIRequestContext, visit: Visit) => {
  const visitRes = await api.post(`visit/${visit.uuid}`, {
    data: {
      location: visit.location.uuid,
      startDatetime: visit.startDatetime,
      visitType: visit.visitType.uuid,
      stopDatetime: dayjs().format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
    },
  });

  return await visitRes.json();
};

export const getVisit = async (api: APIRequestContext, uuid: string): Promise<Visit> => {
  const visitRes = await api.get(`visit/${uuid}?v=full`);
  return await visitRes.json();
};
