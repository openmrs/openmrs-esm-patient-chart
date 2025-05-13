import { type APIRequestContext, expect } from '@playwright/test';
import { type Encounter } from './types';
import { type Visit } from '@openmrs/esm-framework';
import dayjs from 'dayjs';

export interface Observation {
  uuid: string;
  concept: {
    uuid: string;
    display: string;
    conceptClass: {
      uuid: string;
      display: string;
    };
  };
  display: string;
  groupMembers: null | Array<{
    uuid: string;
    concept: {
      uuid: string;
      display: string;
    };
    value: {
      uuid: string;
      display: string;
    };
  }>;
  value: any;
  obsDatetime: string;
}

export const createEncounter = async (
  api: APIRequestContext,
  patientId: string,
  providerId: string,
  visit: Visit,
): Promise<Encounter> => {
  const encounterRes = await api.post('encounter', {
    data: {
      encounterDatetime: dayjs().format(),
      form: 'c75f120a-04ec-11e3-8780-2b40bef9a44b',
      patient: patientId,
      visit: visit,
      encounterProviders: [
        {
          encounterRole: '240b26f9-dd88-4172-823d-4a8bfeb7841f',
          provider: providerId,
        },
      ],
      location: process.env.E2E_LOGIN_DEFAULT_LOCATION_UUID,
      encounterType: '39da3525-afe4-45ff-8977-c53b7b359158',
    },
  });
  await expect(encounterRes.ok()).toBeTruthy();
  return await encounterRes.json();
};

export const deleteEncounter = async (api: APIRequestContext, uuid: string) => {
  await api.delete(`encounter/${uuid}`, { data: {} });
};
