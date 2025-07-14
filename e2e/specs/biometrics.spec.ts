import { expect } from '@playwright/test';
import { test } from '../core';
import { BiometricsAndVitalsPage } from '../pages';

test('Add, edit and delete patient biometrics', async ({ page, patient }) => {
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

  await test.step('When I click the overflow menu on the biometrics row', async () => {
    await biometricsPage.page
      .getByRole('button', { name: /options/i })
      .nth(0)
      .click();
  });

  await test.step('And I click on the `Edit` button', async () => {
    await page.getByRole('menuitem', { name: /edit/i }).click();
  });

  await test.step('Then I should see the `Edit Vitals and Biometrics` form launch in the workspace', async () => {
    await expect(biometricsPage.page.getByText(/edit vitals and biometrics/i)).toBeVisible();
    await expect(biometricsPage.page.getByRole('spinbutton', { name: /height/i })).toHaveValue('170');
    await expect(biometricsPage.page.getByRole('spinbutton', { name: /weight/i })).toHaveValue('65');
    await expect(biometricsPage.page.getByRole('spinbutton', { name: /muac/i })).toHaveValue('25');
  });

  await test.step('When I fill `175` as the height', async () => {
    await biometricsPage.page.getByRole('spinbutton', { name: /height/i }).clear();
    await biometricsPage.page.getByRole('spinbutton', { name: /height/i }).fill('175');
  });

  await test.step('And I fill `70` as the weight', async () => {
    await biometricsPage.page.getByRole('spinbutton', { name: /weight/i }).clear();
    await biometricsPage.page.getByRole('spinbutton', { name: /weight/i }).fill('70');
  });

  await test.step('And I click on the `Save and close` button', async () => {
    await biometricsPage.page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(biometricsPage.page.getByText(/vitals and biometrics updated/i)).toBeVisible();
  });

  await test.step('And I should see the updated biometrics on the page', async () => {
    const headerRow = biometricsPage.biometricsTable().locator('thead > tr');
    const dataRow = biometricsPage.biometricsTable().locator('tbody > tr');

    await expect(headerRow).toContainText(/weight/i);
    await expect(headerRow).toContainText(/height/i);
    await expect(headerRow).toContainText(/bmi/i);
    await expect(headerRow).toContainText(/muac/i);

    await expect(dataRow).toContainText('70');
    await expect(dataRow).toContainText('175');
    await expect(dataRow).toContainText('22.9');
    await expect(dataRow).toContainText('25');
  });

  await test.step('When I click the overflow menu on the biometrics row', async () => {
    await biometricsPage.page
      .getByRole('button', { name: /options/i })
      .nth(0)
      .click();
  });

  await test.step('And I click on the `Delete` button', async () => {
    await page.getByRole('menuitem', { name: /delete/i }).click();
    await page.getByRole('button', { name: /delete/i }).click();
  });

  await test.step('Then I should see a success toast notification', async () => {
    await expect(page.getByText(/Vitals and biometrics deleted/i)).toBeVisible();
  });

  await test.step('And the Biometrics table should be empty', async () => {
    await expect(page.getByText(/There are no biometrics to display for this patient/i)).toBeVisible();
  });
});
