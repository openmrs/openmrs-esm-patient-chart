import { test } from '../core';
import { BiometricsAndVitalsPage } from '../pages';
import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, Patient, startVisit, endVisit } from '../commands';
import { Visit } from '@openmrs/esm-framework';

let patient: Patient;
let visit: Visit;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
});

test('Record Vitals of the patient', async ({ page, api }) => {
  const vitalsPage = new BiometricsAndVitalsPage(page);

  await test.step('When I visit the patient biometirics and vitals page', async () => {
    await vitalsPage.goto(patient.uuid);
  });

  await test.step('And I click record vital signs button', async () => {
    await vitalsPage.page.getByText('Record vital signs').click();
  });

  await test.step('And I filled the form', async () => {
    await vitalsPage.page.getByTitle('systolic').fill('120');
    await vitalsPage.page.getByTitle('diastolic').fill('80');
    await vitalsPage.page.getByTitle('Pulse').fill('80');
    await vitalsPage.page.getByTitle('Respiration Rate').fill('20');
    await vitalsPage.page.getByTitle('Oxygen Saturation').fill('98');
    await vitalsPage.page.getByTitle('Temperature').type('37');
    await vitalsPage.page.getByTitle('Notes').fill('Test notes');
  });

  await test.step('And I click the save button', async () => {
    await vitalsPage.page.getByText('Save').click();
  });

  await test.step('Then I should see the success message', async () => {
    await expect(vitalsPage.page.getByText('saved')).toBeVisible();
  });

  await test.step('Then I should see the vitals record', async () => {
    await expect(vitalsPage.vitalsTable().getByText('37')).toBeVisible();
    await expect(vitalsPage.vitalsTable().getByRole('cell', { name: '80', exact: true })).toBeVisible();
    await expect(vitalsPage.vitalsTable().getByRole('cell', { name: '120 / 80' })).toBeVisible();
    await expect(vitalsPage.vitalsTable().getByText('98')).toBeVisible();
    await expect(vitalsPage.vitalsTable().getByRole('cell', { name: '20 ↑' })).toBeVisible();
  });
});
test.afterEach(async ({ api }) => {
  await endVisit(api, visit.uuid);
  await deletePatient(api, patient.uuid);
});
