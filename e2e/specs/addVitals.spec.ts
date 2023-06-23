import { test } from '../core';
import { BiometricsAndVitalsPage } from '../pages';
import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, Patient } from '../commands';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('Record Vitals of the patient', async ({ page, api }) => {
  const vitalsPage = new BiometricsAndVitalsPage(page);

  await test.step('When I visit the patient biometirics and vitals page', async () => {
    await vitalsPage.goto(patient.uuid);
  });

  await test.step('And I click record vital signs button', async () => {
    await vitalsPage.page.getByText('Record vital signs').click();
  });

});
test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
