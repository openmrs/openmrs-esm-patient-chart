import { type APIRequestContext, type Page, test as base } from '@playwright/test';
import { api } from '../fixtures';
import { type Patient, generateRandomPatient, deletePatient, startVisit, endVisit } from '../commands';
import { type Visit } from '@openmrs/esm-framework';

// This file sets up our custom test harness using the custom fixtures.
// See https://playwright.dev/docs/test-fixtures#creating-a-fixture for details.
// If a spec intends to use one of the custom fixtures, the special `test` function
// exported from this file must be used instead of the default `test` function
// provided by playwright.

export interface CustomTestFixtures {
  loginAsAdmin: Page;
  patient: Patient;
  visit?: Visit;
}

export interface CustomWorkerFixtures {
  api: APIRequestContext;
}

export const test = base.extend<CustomTestFixtures, CustomWorkerFixtures>({
  api: [api, { scope: 'worker' }],

  patient: [
    async ({ api }, use) => {
      const patient = await generateRandomPatient(api);
      await use(patient);
      await deletePatient(api, patient.uuid);
    },
    { scope: 'test', auto: true },
  ],

  visit: [
    async ({ api, patient }, use) => {
      const visit = await startVisit(api, patient.uuid);
      await use(visit);
      await endVisit(api, visit);
    },
    { scope: 'test', auto: true },
  ],
});
