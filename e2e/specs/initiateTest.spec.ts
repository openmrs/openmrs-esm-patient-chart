import { test } from '../core';
import { PatientAllergiesPage } from '../pages';
import { expect } from '@playwright/test';
import { deletePatient, generateRandomPatient, getPatient, Patient } from '../commands';

let patient: Patient;
test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});
test('Should initiate a test', async ({ page }) => {
  const patientAllergiesPage = new PatientAllergiesPage(page);
  await patientAllergiesPage.goto(patient.uuid);
  await expect(page).toHaveTitle('OpenMRS');
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
