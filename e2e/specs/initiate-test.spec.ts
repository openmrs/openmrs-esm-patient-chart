import { expect } from '@playwright/test';
import { test } from '../core';
import { deletePatient, generateRandomPatient, Patient } from '../commands';
import { AllergiesPage } from '../pages';

let patient: Patient;
test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('Should initiate a test', async ({ page }) => {
  const patientAllergiesPage = new AllergiesPage(page);
  await patientAllergiesPage.goto(patient.uuid);
  await expect(page).toHaveTitle('OpenMRS');
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
