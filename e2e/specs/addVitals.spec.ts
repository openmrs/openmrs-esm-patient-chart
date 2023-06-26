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

  await test.step('And I start a visit', async () => {
    await vitalsPage.startVisit();
    await expect(vitalsPage.page.getByText('Active Visit')).toBeVisible();
  });

  await test.step('And I click record vital signs button', async () => {
    await vitalsPage.page.getByText('Record vital signs').click();
  });

  await test.step('And I enter the temperature value', async () => {
    await vitalsPage.page.locator('#Temperature').fill('37');
  });

  await test.step('Then I enter the blood pressure value', async () => {
    await vitalsPage.page.locator('#systolic').fill('120');
    await vitalsPage.page.locator('#diastolic').fill('80');
  });

  await test.step('And I enter the pulse value', async () => {
    await vitalsPage.page.locator('#Pulse').fill('80');
  });

  await test.step('And I enter the oxygen saturation value', async () => {
    await vitalsPage.page.getByTitle('Oxygen Saturation').fill('98');
  });

  await test.step('And I enter respiratory rate value', async () => {
    await vitalsPage.page.getByTitle('Respiration Rate').fill('20');
  });

  await test.step('Then I fill the notes field', async () => {
    await vitalsPage.page.locator('#Notes').fill('Test notes');
  });

  await test.step('And I click the save button', async () => {
    await vitalsPage.page.getByText('Save').click();
  });

  await test.step('Then I end Visit', async () => {
    await vitalsPage.page.getByText('Actions').click();
    await vitalsPage.page.getByText('End visit').click();
  });

  await test.step('Then I should see the vitals record', async () => {
    await expect(vitalsPage.tableRow().getByText('37')).toBeVisible();
    await expect(vitalsPage.tableRow().getByRole('cell', { name: '120 / 80' })).toBeVisible();
    await expect(vitalsPage.tableRow().getByRole('cell', { name: '80', exact: true })).toBeVisible();
    await expect(vitalsPage.tableRow().getByText('98')).toBeVisible();
    await expect(vitalsPage.tableRow().getByRole('cell', { name: '20 ↑' })).toBeVisible();
  });
});
test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
