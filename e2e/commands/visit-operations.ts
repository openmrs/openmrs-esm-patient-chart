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
