import { type APIRequestContext, type Page, test as base } from '@playwright/test';
import { api } from '../fixtures';
import {
  type Patient,
  generateRandomPatient,
  deletePatient,
  startVisit,
  endVisit,
  generateNewbornPatient,
  generatePatientByAge,
} from '../commands';
import { type Visit } from '@openmrs/esm-framework';

// This file sets up our custom test harness using the custom fixtures.
// See https://playwright.dev/docs/test-fixtures#creating-a-fixture for details.
// If a spec intends to use one of the custom fixtures, the special `test` function
// exported from this file must be used instead of the default `test` function
// provided by playwright.

export interface CustomTestFixtures {
  loginAsAdmin: Page;
  patient: Patient;
  newbornPatient: Patient;
  infantPatient: Patient;
  childPatient: Patient;
  adultPatient: Patient;
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
      try {
        if (patient) await deletePatient(api, patient.uuid);
      } catch (e) {
        console.warn('Failed to delete patient:', e);
      }
    },
    { scope: 'test', auto: true },
  ],
  // Newborn patient (0-1 month)
  newbornPatient: [
    async ({ api }, use) => {
      const patient = await generateNewbornPatient(api, 1);
      await use(patient);
      try {
        if (patient) await deletePatient(api, patient.uuid);
      } catch (e) {
        console.warn('Failed to delete newborn patient:', e);
      }
    },
    { scope: 'test' },
  ],

  // Infant patient (6 months)
  infantPatient: [
    async ({ api }, use) => {
      const patient = await generatePatientByAge(api, { months: 6 });
      await use(patient);
      try {
        if (patient) await deletePatient(api, patient.uuid);
      } catch (e) {
        console.warn('Failed to delete infant patient:', e);
      }
    },
    { scope: 'test' },
  ],

  // Child patient (8 years)
  childPatient: [
    async ({ api }, use) => {
      const patient = await generatePatientByAge(api, { years: 8 });
      await use(patient);
      try {
        if (patient) await deletePatient(api, patient.uuid);
      } catch (e) {
        console.warn('Failed to delete child patient:', e);
      }
    },
    { scope: 'test' },
  ],

  // Adult patient (30 years)
  adultPatient: [
    async ({ api }, use) => {
      const patient = await generatePatientByAge(api, { years: 30 });
      await use(patient);
      try {
        if (patient) await deletePatient(api, patient.uuid);
      } catch (e) {
        console.warn('Failed to delete adult patient:', e);
      }
    },
    { scope: 'test' },
  ],

  visit: [
    async ({ api, patient }, use) => {
      const visit = await startVisit(api, patient.uuid);
      await use(visit);
      try {
        if (visit) await endVisit(api, visit);
      } catch (e) {
        console.warn('Failed to end visit:', e);
      }
    },
    { scope: 'test', auto: true },
  ],
});
