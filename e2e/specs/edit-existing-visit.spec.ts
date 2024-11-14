import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import { deletePatient, generateRandomPatient, type Patient, startVisit } from '../commands';
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

    const startDateInput = chartPage.page.locator('input#visitStartDateInput');
    const startTimeInput = chartPage.page.locator('input#visitStartTime');

    await expect(startDateInput).toBeVisible();
    const dateValue = await startDateInput.inputValue();
    expect(dateValue).not.toBe('');
    expect(dateValue).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);

    await expect(startTimeInput).toBeVisible();
    const timeValue = await startTimeInput.inputValue();
    expect(timeValue).toMatch(/^(1[0-2]|0?[1-9]):([0-5][0-9])$/);

    await expect(chartPage.page.getByRole('combobox', { name: /select a location/i })).toBeVisible();
    await expect(chartPage.page.getByRole('combobox', { name: /select a location/i })).toHaveValue('Outpatient Clinic');
    await expect(chartPage.page.getByText(/visit type/i)).toBeVisible();
    await expect(chartPage.page.getByLabel(/facility visit/i)).toBeChecked();
    await expect(chartPage.page.getByRole('search', { name: /visit type/i })).toBeVisible();
    await expect(chartPage.page.getByLabel(/facility visit/i)).toBeVisible();
    await expect(chartPage.page.getByLabel(/home visit/i)).toBeVisible();
    await expect(chartPage.page.getByLabel(/opd visit/i)).toBeVisible();
    await expect(chartPage.page.getByLabel(/offline visit/i)).toBeVisible();
    await expect(chartPage.page.getByLabel(/group session/i)).toBeVisible();
    await expect(chartPage.page.getByRole('button', { name: /discard/i })).toBeVisible();
    await expect(chartPage.page.locator('form').getByRole('button', { name: /update visit/i })).toBeVisible();
  });

  await test.step('And when I change the visit details and submit the form', async () => {
    await chartPage.page.getByRole('button', { name: /clear selected item/i }).click();
    await chartPage.page.getByRole('combobox', { name: /select a location/i }).click();
    await chartPage.page.getByRole('option', { name: /inpatient ward/i }).click();
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
    await expect(chartPage.page.getByRole('tooltip')).toContainText(/home visit/i);
    await expect(chartPage.page.getByRole('tooltip')).toContainText(/started: today/i);
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
