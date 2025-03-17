import { expect } from '@playwright/test';
import { test } from '../core';
import { type Patient, generateRandomPatient, deletePatient } from '../commands';
import { ChartPage } from '../pages';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('Start and end a new visit', async ({ page }) => {
  const chartPage = new ChartPage(page);

  await test.step('When I visit the chart summary page', async () => {
    await chartPage.goTo(patient.uuid);
  });

  await test.step('And I click on the `Start visit` button in the Actions overflow menu', async () => {
    await chartPage.page.getByRole('button', { name: /actions/i }).click();
    await chartPage.page.getByRole('menuitem', { name: /start visit/i }).click();
  });

  await test.step('Then I should see the `Start Visit` form launch in the workspace', async () => {
    await expect(chartPage.page.getByRole('tab', { name: /new/i })).toBeVisible();
    await expect(chartPage.page.getByRole('tab', { name: /ongoing/i })).toBeVisible();
    await expect(chartPage.page.getByRole('tab', { name: /in the past/i })).toBeVisible();
    await expect(chartPage.page.getByRole('combobox', { name: /select a location/i })).toBeVisible();
    await expect(chartPage.page.getByText(/visit type/i)).toBeVisible();
    await expect(chartPage.page.getByRole('search', { name: /search for a visit type/i })).toBeVisible();
    await expect(chartPage.page.getByLabel(/Facility Visit/i)).toBeVisible();
    await expect(chartPage.page.getByLabel(/Home Visit/i)).toBeVisible();
    await expect(chartPage.page.getByLabel(/OPD Visit/i)).toBeVisible();
    await expect(chartPage.page.getByLabel(/Offline Visit/i)).toBeVisible();
    await expect(chartPage.page.getByLabel(/Group Session/i)).toBeVisible();
    await expect(chartPage.page.getByRole('button', { name: /discard/i })).toBeVisible();
    await expect(chartPage.page.locator('form').getByRole('button', { name: /start visit/i })).toBeVisible();
  });

  await test.step('When I select visit status: Ongoing', async () => {
    await chartPage.page.getByRole('tab', { name: /ongoing/i }).click();
  });
  await test.step('Then I should see Start date and time picker', async () => {
    await expect(chartPage.page.getByRole('textbox', { name: /start date/i })).toBeVisible();
    await expect(chartPage.page.getByRole('textbox', { name: /start time/i })).toBeVisible();
    await expect(chartPage.page.getByLabel(/start time format/i)).toBeVisible();
  });

  await test.step('When I select visit status: In the past', async () => {
    await chartPage.page.getByRole('tab', { name: /in the past/i }).click();
  });
  await test.step('Then I should see Start date and time picker AND End date and time picker', async () => {
    await expect(chartPage.page.getByRole('textbox', { name: /start date/i })).toBeVisible();
    await expect(chartPage.page.getByRole('textbox', { name: /start time/i })).toBeVisible();
    await expect(chartPage.page.getByLabel(/start time format/i)).toBeVisible();
    await expect(chartPage.page.getByRole('textbox', { name: /end date/i })).toBeVisible();
    await expect(chartPage.page.getByRole('textbox', { name: /end time/i })).toBeVisible();
    await expect(chartPage.page.getByLabel(/end time format/i)).toBeVisible();
  });

  await test.step('When I select visit status: new', async () => {
    await chartPage.page.getByRole('tab', { name: /new/i }).click();
  });

  await test.step('And I select the visit type: `OPD Visit`', async () => {
    await chartPage.page.getByText(/opd visit/i).click();
  });

  await test.step('And I click on the `Start Visit` button', async () => {
    await chartPage.page
      .locator('form')
      .getByRole('button', { name: /start visit/i })
      .click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(chartPage.page.getByText(/opd visit started successfully/i)).toBeVisible();
  });

  await test.step('And I should see the Active Visit tag on the patient header', async () => {
    await expect(chartPage.page.getByLabel(/active visit/i)).toBeVisible();
  });

  await test.step('When I click on the `End Visit` button in the Actions overflow menu', async () => {
    await chartPage.page.getByRole('button', { name: /actions/i }).click();
    await chartPage.page.getByRole('menuitem', { name: /end visit/i }).click();
  });

  await test.step('Then I should see a confirmation modal', async () => {
    await expect(chartPage.page.getByText(/are you sure you want to end this active visit?/i)).toBeVisible();
  });

  await test.step('When I click on the `End Visit` button to confirm', async () => {
    await chartPage.page.getByRole('button', { name: 'danger End Visit' }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(chartPage.page.getByText(/ended current visit successfully/i)).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
