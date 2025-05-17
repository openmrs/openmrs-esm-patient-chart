import { type APIRequestContext, expect } from '@playwright/test';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { type Encounter } from './types';
import dayjs from 'dayjs';

export const generateRandomTestOrder = async (
  api: APIRequestContext,
  patientId: string,
  encounter: Encounter,
  providerUuid: string,
): Promise<Order> => {
  const order = await api.post('order', {
    data: {
      orderType: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
      type: 'testorder',
      action: 'new',
      accessionNumber: null,
      urgency: 'ROUTINE',
      dateActivated: encounter.encounterDateTime,
      scheduledDate: null,
      dateStopped: null,
      autoExpireDate: null,
      careSetting: '6f0c9a92-6f24-11e3-af88-005056821db0',
      encounter: encounter,
      patient: patientId,
      concept: '887AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      orderer: providerUuid,
      frequency: null,
      orderReason: null,
      orderReasonNonCoded: 'order reason',
      instructions: null,
      commentToFulfiller: null,
      display: 'Serum glucose',
      fulfillerStatus: null,
      fulfillerComment: null,
      specimenSource: null,
      laterality: null,
      clinicalHistory: null,
      numberOfRepeats: null,
    },
  });
  await expect(order.ok()).toBeTruthy();
  return await order.json();
};

export const deleteTestOrder = async (api: APIRequestContext, uuid: string) => {
  await api.delete(`order/${uuid}?purge=true`, { data: {} });
};
