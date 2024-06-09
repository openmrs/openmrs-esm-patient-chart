import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import { generateRandomPatient, deletePatient, type Patient, startVisit, endVisit } from '../commands';
import { test } from '../core';
import { BiometricsAndVitalsPage } from '../pages';

let patient: Patient;
let visit: Visit;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
});

test('Record biometrics', async ({ page }) => {
  const biometricsPage = new BiometricsAndVitalsPage(page);

  await test.step('When I visit the vitals and biometrics page', async () => {
    await biometricsPage.goTo(patient.uuid);
  });

  await test.step('And I click on the `Record biometrics` link to launch the form', async () => {
    await biometricsPage.page.getByText(/record biometrics/i).click();
  });

  await test.step('Then I should see the `Record Vitals and Biometrics` form launch in the workspace', async () => {
    await expect(biometricsPage.page.getByText(/record vitals and biometrics/i)).toBeVisible();
  });

  await test.step('When I fill `170` as the height', async () => {
    await biometricsPage.page.getByRole('spinbutton', { name: /height/i }).fill('170');
  });

  await test.step('And I fill `65` as the weight', async () => {
    await biometricsPage.page.getByRole('spinbutton', { name: /weight/i }).fill('65');
  });

  await test.step('Then I should see `22.51` as the auto calculated body mass index', async () => {
    await expect(biometricsPage.page.getByRole('spinbutton', { name: /bmi/i })).toHaveValue('22.5');
  });

  await test.step('When I fill `25` as the mid upper arm circumference ', async () => {
    await biometricsPage.page.getByRole('spinbutton', { name: /muac/i }).fill('25');
  });

  await test.step('And I click on the `Save and close` button', async () => {
    await biometricsPage.page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(biometricsPage.page.getByText(/vitals and biometrics saved/i)).toBeVisible();
  });

  await test.step('And I should see the newly recorded biometrics on the page', async () => {
    const headerRow = biometricsPage.biometricsTable().locator('thead > tr');
    const dataRow = biometricsPage.biometricsTable().locator('tbody > tr');

    await expect(headerRow).toContainText(/weight/i);
    await expect(headerRow).toContainText(/height/i);
    await expect(headerRow).toContainText(/bmi/i);
    await expect(headerRow).toContainText(/muac/i);
    await expect(dataRow).toContainText('65');
    await expect(dataRow).toContainText('170');
    await expect(dataRow).toContainText('22.5');
    await expect(dataRow).toContainText('25');
  });
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit.uuid);
  await deletePatient(api, patient.uuid);
});
