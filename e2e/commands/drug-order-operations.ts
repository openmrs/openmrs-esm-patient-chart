import { type APIRequestContext, expect } from '@playwright/test';
import { type Order } from '@openmrs/esm-patient-common-lib';
import dayjs from 'dayjs';

export const generateRandomDrugOrder = async (
  api: APIRequestContext,
  patientId: string,
  encounterUuid: string,
  providerUuid: string,
): Promise<Order> => {
  const order = await api.post('order', {
    data: {
      orderType: '131168f4-15f5-102d-96e4-000c29c2a5d7',
      type: 'drugorder',
      action: 'new',
      drug: '09e58895-e7f0-4649-b7c0-e665c5c08e93',
      urgency: 'ROUTINE',
      dateActivated: dayjs().format(),
      careSetting: '6f0c9a92-6f24-11e3-af88-005056821db0',
      encounter: encounterUuid,
      patient: patientId,
      concept: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      orderer: providerUuid,
      dosingType: 'org.openmrs.SimpleDosingInstructions',
      dose: '1.0',
      doseUnits: '161553AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      route: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      frequency: '160862AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      quantity: 1.0,
      numRefills: 0,
      quantityUnits: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      durationUnits: { uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Days' },
      orderReason: null,
      orderReasonNonCoded: 'order reason',
    },
  });
  await expect(order.ok()).toBeTruthy();
  return await order.json();
};

export const deleteDrugOrder = async (api: APIRequestContext, uuid: string) => {
  await api.delete(`order/${uuid}`, { data: {} });
};
