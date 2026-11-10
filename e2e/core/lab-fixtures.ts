import { type Order } from '@openmrs/esm-patient-common-lib';
import { createEncounter, deleteEncounter, deleteTestOrder, generateRandomTestOrder, getProvider } from '../commands';
import { type Encounter } from '../commands/types';
import { test as base } from './test';

export interface ExistingLabOrderFixtures {
  existingLabOrder: {
    testOrder: Order;
    encounter: Encounter;
  };
}

// Seeds a lab order (Serum glucose) via the REST API with a null fulfillerStatus, so it starts
// life under both the patient chart's Orders table and the Laboratory app's "Tests ordered" tab,
// ready to be resulted. Shared by the lab-orders and lab-app-results specs so the seeding and
// cleanup live in one place; the order and its encounter are torn down after each test.
export const test = base.extend<ExistingLabOrderFixtures>({
  existingLabOrder: async ({ api, patient, visit }, use) => {
    const orderer = await getProvider(api);
    const encounter = await createEncounter(api, patient.uuid, orderer.uuid, visit);
    const testOrder = await generateRandomTestOrder(api, patient.uuid, encounter, orderer.uuid);

    try {
      await use({ testOrder, encounter });
    } finally {
      if (testOrder?.uuid) {
        await deleteTestOrder(api, testOrder.uuid);
      }
      if (encounter?.uuid) {
        await deleteEncounter(api, encounter.uuid);
      }
    }
  },
});
