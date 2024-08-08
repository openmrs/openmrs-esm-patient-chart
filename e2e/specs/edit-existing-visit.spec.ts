import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import { type Patient, generateRandomPatient, deletePatient, startVisit } from '../commands';
import { test } from '../core';
import { ChartPage, VisitsPage } from '../pages';

let patient: Patient;
let visit: Visit;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
});

test('Edit an existing visit', async ({ page }) => {
  const chartPage = new ChartPage(page);
  const visitsPage = new VisitsPage(page);

  await test.step('When I visit the Visits summary page', async () => {
    await visitsPage.goTo(patient.uuid);
    await expect(visitsPage.page.getByRole('button', { name: /edit visit details/i })).toBeVisible();
  });

  await test.step('And I click on the `Edit visit details` button on an active visit', async () => {
    await visitsPage.page.getByRole('button', { name: /edit visit details/i }).click();
  });

  await test.step('Then I should see the `Edit Visit` form launch in the workspace', async () => {
    await expect(chartPage.page.getByText(/visit start date and time/i)).toBeVisible();
    await expect(chartPage.page.getByPlaceholder(/dd\/mm\/yyyy/i)).toBeVisible();
    await expect(chartPage.page.getByPlaceholder(/hh\:mm/i)).toBeVisible();
    await expect(chartPage.page.getByRole('combobox', { name: /select a location/i })).toBeVisible();
    await expect(chartPage.page.getByRole('combobox', { name: /select a location/i })).toHaveValue('Outpatient Clinic');
    await expect(chartPage.page.getByText(/visit type/i)).toBeVisible();
    await expect(chartPage.page.getByLabel(/facility visit/i)).toBeChecked();
    await expect(chartPage.page.getByRole('search', { name: /search for a visit type/i })).toBeVisible();
    await expect(chartPage.page.getByLabel(/facility visit/i)).toBeVisible();
    await expect(chartPage.page.getByLabel(/home visit/i)).toBeVisible();
    await expect(chartPage.page.getByLabel(/opd visit/i)).toBeVisible();
    await expect(chartPage.page.getByLabel(/offline visit/i)).toBeVisible();
    await expect(chartPage.page.getByLabel(/group session/i)).toBeVisible();
    await expect(chartPage.page.getByRole('button', { name: /discard/i })).toBeVisible();
    await expect(chartPage.page.locator('form').getByRole('button', { name: /update visit/i })).toBeVisible();
  });

  await test.step('And when I change the visit details and submit the form', async () => {
    // TODO: Make it possible to select a different location
    await chartPage.page.getByText(/home visit/i).click();
    await expect(chartPage.page.getByLabel(/home visit/i)).toBeChecked();
    await chartPage.page.getByRole('button', { name: /update visit/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(chartPage.page.getByText(/visit details updated/i)).toBeVisible();
    await expect(chartPage.page.getByText(/home visit updated successfully/i)).toBeVisible();
  });

  await test.step('And I should see the updated visit details', async () => {
    await expect(chartPage.page.getByRole('button', { name: /active visit/i })).toBeVisible();
    await chartPage.page.getByLabel(/active visit/i).click();
    await expect(chartPage.page.getByRole('tooltip')).toContainText('Home Visit');
    await expect(chartPage.page.getByRole('tooltip')).toContainText('Started: Today');
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
