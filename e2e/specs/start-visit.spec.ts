import { expect } from '@playwright/test';
import { test } from '../core';
import { type Patient, generateRandomPatient, deletePatient } from '../commands';
import { ChartPage } from '../pages';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('Start a visit', async ({ page, api }) => {
  const chartPage = new ChartPage(page);

  await test.step('When I visit the chart summary page', async () => {
    await chartPage.goTo(patient.uuid);
  });

  await test.step('And I click the `Start a visit` button ', async () => {
    await chartPage.page.getByRole('button', { name: /start a visit/i }).click();
  });

  await test.step('Then I should see the `Start Visit` form in the workspace', async () => {
    await expect(chartPage.page.getByText(/visit start date and time/i)).toBeVisible();
    await expect(chartPage.page.getByPlaceholder(/dd\/mm\/yyyy/i)).toBeVisible();
    await expect(chartPage.page.getByPlaceholder(/hh\:mm/i)).toBeVisible();
    await expect(chartPage.page.getByRole('combobox', { name: /select a location/i })).toBeVisible();
    await expect(chartPage.page.getByText(/visit type/i)).toBeVisible();
    await expect(chartPage.page.getByRole('search', { name: /search for a visit type/i })).toBeVisible();
    await expect(chartPage.page.getByLabel(/Facility Visit/i)).toBeVisible();
    await expect(chartPage.page.getByLabel(/Home Visit/i)).toBeVisible();
    await expect(chartPage.page.getByLabel(/OPD Visit/i)).toBeVisible();
    await expect(chartPage.page.getByLabel(/Offline Visit/i)).toBeVisible();
    await expect(chartPage.page.getByLabel(/Group Session/i)).toBeVisible();
    await expect(chartPage.page.getByRole('button', { name: /discard/i })).toBeVisible();
    await expect(chartPage.page.locator('form').getByRole('button', { name: /start a visit/i })).toBeVisible();
  });

  await test.step('And if I select a visit type and then I click the `Start a visit` button', async () => {
    await chartPage.page.getByText(/opd visit/i).click();
    await chartPage.page
      .locator('form')
      .getByRole('button', { name: /start a visit/i })
      .click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(chartPage.page.getByText(/opd visit started successfully/i)).toBeVisible();
  });

  await test.step('And I should see the Active Visit tag on the patient header', async () => {
    await expect(chartPage.page.getByLabel(/active visit/i)).toBeVisible();
    await chartPage.page.getByRole('button', { name: /end visit/i }).click();
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
