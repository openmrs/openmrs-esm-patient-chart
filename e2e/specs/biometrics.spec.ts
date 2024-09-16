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
  const headerRow = biometricsPage.biometricsTable().locator('thead > tr');
  const dataRow = biometricsPage.biometricsTable().locator('tbody > tr');

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
    await expect(headerRow).toContainText(/weight/i);
    await expect(headerRow).toContainText(/height/i);
    await expect(headerRow).toContainText(/bmi/i);
    await expect(headerRow).toContainText(/muac/i);
    await expect(dataRow).toContainText('65');
    await expect(dataRow).toContainText('170');
    await expect(dataRow).toContainText('22.5');
    await expect(dataRow).toContainText('25');
  });

  await test.step('When I click the overflow menu in the table row with the newly added biometrics', async () => {
    await biometricsPage.page
      .getByRole('button', { name: /options/i })
      .nth(0)
      .click();
  });

  await test.step('And I click the `Edit` button', async () => {
    await biometricsPage.page.getByRole('menuitem', { name: /edit/i }).click();
  });

  await test.step('Then I should see the biomterics form launch in the workspace in edit mode', async () => {
    await expect(biometricsPage.page.getByText(/Edit vitals and biometrics/i)).toBeVisible();
  });

  await test.step('When I change the weight to `70`', async () => {
    await biometricsPage.page.getByRole('spinbutton', { name: /weight/i }).clear();
    await biometricsPage.page.getByRole('spinbutton', { name: /weight/i }).fill('70');
  });

  await test.step('And I click on the `Save and close` button', async () => {
    await biometricsPage.page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(biometricsPage.page.getByText(/vitals and biometrics updated/i)).toBeVisible();
  });

  await test.step('And I should see the newly edited biometrics on the page', async () => {
    await expect(headerRow).toContainText(/weight/i);
    await expect(headerRow).toContainText(/height/i);
    await expect(headerRow).toContainText(/bmi/i);
    await expect(headerRow).toContainText(/muac/i);
    await expect(dataRow).toContainText('70');
    await expect(dataRow).toContainText('170');
    await expect(dataRow).toContainText('24.2');
    await expect(dataRow).toContainText('25');
  });

  await test.step('When I click the overflow menu in the table row with the newly edited biometrics', async () => {
    await biometricsPage.page
      .getByRole('button', { name: /options/i })
      .nth(0)
      .click();
  });

  await test.step('And I click the `Delete` button', async () => {
    await biometricsPage.page.getByRole('menuitem', { name: /delete/i }).click();
  });

  await test.step('And I see the delete modal', async () => {
    await expect(biometricsPage.page.getByRole('heading', { name: /Delete Vitals and Biometrics/i })).toBeVisible();
  });

  await test.step('And I click the Delete button in the modal', async () => {
    await biometricsPage.page.getByRole('button', { name: /danger Delete/i }).click();
  });

  await test.step('Then I see the success notification', async () => {
    await expect(biometricsPage.page.getByText(/vitals and biometrics deleted/i)).toBeVisible();
  });

  await test.step('And the biometrics table should be empty', async () => {
    await expect(biometricsPage.page.getByText(/there are no biometrics to display for this patient/i)).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit.uuid);
  await deletePatient(api, patient.uuid);
});
