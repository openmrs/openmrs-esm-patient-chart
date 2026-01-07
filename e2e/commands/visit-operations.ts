import { type APIRequestContext, expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import dayjs from 'dayjs';

type VisitSummary = { uuid: string };
type VisitSearchResponse = {
  results?: Array<VisitSummary>;
};

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

export const getVisit = async (api: APIRequestContext, uuid: string): Promise<Visit> => {
  const visitRes = await api.get(`visit/${uuid}?v=full`);
  return await visitRes.json();
};

const fetchActiveVisits = async (api: APIRequestContext, patientUuid: string) => {
  const res = await api.get(`visit?patient=${patientUuid}&active=true`);
  expect(res.ok()).toBeTruthy();
  const data: VisitSearchResponse = await res.json();
  return data.results ?? [];
};

const voidVisits = async (api: APIRequestContext, visits: Array<VisitSummary>) => {
  for (const visit of visits) {
    const voidRes = await api.post(`visit/${visit.uuid}`, { data: { voided: true } });
    expect(voidRes.ok()).toBeTruthy();
  }
};

export const ensureNoActiveVisits = async (api: APIRequestContext, patientUuid: string, timeout = 5000) => {
  await expect
    .poll(
      async () => {
        const visits = await fetchActiveVisits(api, patientUuid);
        if (visits.length > 0) {
          await voidVisits(api, visits);
          const remainingVisits = await fetchActiveVisits(api, patientUuid);
          return remainingVisits.length;
        }
        return visits.length;
      },
      { timeout },
    )
    .toBe(0);
};
