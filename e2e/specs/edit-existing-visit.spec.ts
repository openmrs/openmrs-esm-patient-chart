import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import { getVisit, visitStartDatetime } from '../commands';
import { test } from '../core';
import { ChartPage, VisitsPage } from '../pages';

test('Edit an existing ongoing visit', async ({ page, api, patient, visit }) => {
  const chartPage = new ChartPage(page);
  const visitsPage = new VisitsPage(page);

  await test.step('When I navigate to the visit history table', async () => {
    await visitsPage.goTo(patient.uuid);
  });

  await test.step('And I click on the `Edit` button on an active visit', async () => {
    await visitsPage.page.getByRole('button', { name: /edit/i }).click();
  });

  await test.step('Then I should see the `Edit Visit` form launch in the workspace', async () => {
    await expect(chartPage.page.getByText(/visit start date/i)).toBeVisible();

    const startDateInput = chartPage.page.getByTestId('visitStartDateInput');
    const startDateDayInput = startDateInput.getByRole('spinbutton', { name: /day/i });
    const startDateMonthInput = startDateInput.getByRole('spinbutton', { name: /month/i });
    const startDateYearInput = startDateInput.getByRole('spinbutton', { name: /year/i });

    const startTimeInput = chartPage.page.getByRole('textbox', { name: /start time/i });

    await expect(startDateInput).toBeVisible();
    const startDateDayInputValue = await startDateDayInput.textContent();
    expect(startDateDayInputValue).toBe(visitStartDatetime.format('DD'));
    const startDateMonthInputValue = await startDateMonthInput.textContent();
    expect(startDateMonthInputValue).toBe(visitStartDatetime.format('MM'));
    const startDateYearInputValue = await startDateYearInput.textContent();
    expect(startDateYearInputValue).toBe(visitStartDatetime.format('YYYY'));

    await expect(startTimeInput).toBeVisible();
    const timeValue = await startTimeInput.inputValue();
    expect(timeValue).toMatch(/^(1[0-2]|0?[1-9]):([0-5][0-9])$/);

    await expect(chartPage.page.getByRole('combobox', { name: /select a location/i })).toBeVisible();
    await expect(chartPage.page.getByRole('combobox', { name: /select a location/i })).toHaveValue('Outpatient Clinic');
    await expect(chartPage.page.getByRole('heading', { name: /visit type/i })).toBeVisible();
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
    await chartPage.page.getByRole('combobox', { name: /select a location/i }).clear();
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

  await test.step('And the visit should not have ended', async () => {
    const updatedVisit = await getVisit(api, visit.uuid);
    expect(updatedVisit.stopDatetime).toBeNull();
  });
});

test('Edit an existing ongoing visit to have an end time', async ({ page, api, patient, visit }) => {
  const chartPage = new ChartPage(page);
  const visitsPage = new VisitsPage(page);

  await test.step('When I visit the Visits summary page', async () => {
    await visitsPage.goTo(patient.uuid);
    await expect(visitsPage.page.getByRole('button', { name: /edit/i })).toBeVisible();
  });

  await test.step('And I click on the `Edit` button on an active visit', async () => {
    await visitsPage.page.getByRole('button', { name: /edit/i }).click();
  });

  await test.step('Then I should see the visit status `Ongoing` and `Ended` tabs', async () => {
    await expect(visitsPage.page.getByRole('tab', { name: /ongoing/i })).toBeVisible();
    await expect(visitsPage.page.getByRole('tab', { name: /ended/i })).toBeVisible();
  });

  await test.step('When I click on visit status `Ended` and fill in end date time', async () => {
    await visitsPage.page.getByRole('tab', { name: /ended/i }).click();

    await chartPage.page.getByRole('textbox', { name: /start time/i }).fill('12:00');
    await chartPage.page.getByLabel(/start time format/i).selectOption('AM');

    await chartPage.page.getByRole('textbox', { name: /end time/i }).fill('12:10');
    await chartPage.page.getByLabel(/end time format/i).selectOption('AM');
  });

  await test.step('And when I submit the form', async () => {
    await chartPage.page.getByRole('button', { name: /update visit/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(chartPage.page.getByText(/visit details updated/i)).toBeVisible();
    await expect(chartPage.page.getByText(/facility visit updated successfully/i)).toBeVisible();
  });

  await test.step('And the visit should have ended', async () => {
    const updatedVisit = await getVisit(api, visit.uuid);
    expect(updatedVisit.stopDatetime).not.toBeNull();
  });
});
