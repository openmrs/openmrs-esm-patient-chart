import { test } from '../core';
import { BiometricsAndVitalsPage } from '../pages';
import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, Patient } from '../commands';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('Record biometrics of the patient', async ({ page, api }) => {
  const biometricsPage = new BiometricsAndVitalsPage(page);

  await test.step('When I visit the patient biometirics and vitals page', async () => {
    await biometricsPage.goto(patient.uuid);
  });

  await test.step('And I start a visit', async () => {
    await biometricsPage.startVisit();
    await expect(biometricsPage.page.getByText('Active Visit')).toBeVisible();
  });

  await test.step('And I click record biometrics button', async () => {
    await biometricsPage.page.getByText('Record biometrics').click();
  });

  await test.step('And I enter the height value', async () => {
    await biometricsPage.page.locator('#Height').fill('170');
  });

  await test.step('Then I enter the weight value', async () => {
    await biometricsPage.page.locator('#Weight').fill('65');
  });

  await test.step('And I check the BMI value', async () => {
    await expect(biometricsPage.page.locator('#BMI')).toHaveValue('22.5');
  });

  await test.step('And I enter the MUAC value', async () => {
    await biometricsPage.page.locator('#MUAC').fill('25');
  });

  await test.step('Then I submit the form', async () => {
    await biometricsPage.page.getByText('Save').click();
  });

  await test.step('Then I end Visit', async () => {
    await biometricsPage.page.getByText('Actions').click();
    await biometricsPage.page.getByText('End visit').click();
    await biometricsPage.page.getByText('End Visit').click();
  });

  await test.step('Then I should see the biometrics record', async () => {
    await expect(biometricsPage.tableRow().getByText('170')).toBeVisible();
    await expect(biometricsPage.tableRow().getByText('65')).toBeVisible();
    await expect(biometricsPage.tableRow().getByText('22.5')).toBeVisible();
    await expect(biometricsPage.tableRow().getByText('25')).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
