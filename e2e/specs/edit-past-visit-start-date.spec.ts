import { expect } from '@playwright/test';
import dayjs from 'dayjs';
import { getVisit, endVisit, visitStartDatetime } from '../commands';
import { test } from '../core';
import { ChartPage, VisitsPage } from '../pages';

test('Edit start date of a past visit', async ({ page, api, patient, visit }) => {
  const chartPage = new ChartPage(page);
  const visitsPage = new VisitsPage(page);
  const targetStartDate = visitStartDatetime.subtract(1, 'day');
  await test.step('Given the current visit is ended (past visit)', async () => {
    await endVisit(api, visit);
  });

  await test.step('When I navigate to the Visits page', async () => {
    await visitsPage.goTo(patient.uuid);
  });

  await test.step('And I click Edit on the past visit', async () => {
    const editButton = visitsPage.page.getByRole('button', { name: /^edit$/i }).first();
    await expect(editButton).toBeVisible();
    await editButton.click();
  });

  await test.step('Then I see the Edit Visit form with visit status tabs', async () => {
    await expect(visitsPage.page.getByRole('tab', { name: /ongoing/i })).toBeVisible();
    await expect(visitsPage.page.getByRole('tab', { name: /ended/i })).toBeVisible();
  });

  await test.step('When I change the visit start date to two days ago', async () => {
    const newStartDate = targetStartDate;
    await visitsPage.page.getByRole('tab', { name: /ongoing/i }).click();
    await expect(chartPage.page.getByRole('button', { name: /update visit/i })).toBeVisible();
    await expect(chartPage.page.getByTestId('visitStartDateInput')).toBeVisible();

    const startDateInput = chartPage.page.getByTestId('visitStartDateInput');
    const startDateDayInput = startDateInput.getByRole('spinbutton', { name: /day/i });
    const startDateMonthInput = startDateInput.getByRole('spinbutton', { name: /month/i });
    const startDateYearInput = startDateInput.getByRole('spinbutton', { name: /year/i });

    await startDateDayInput.click();
    await startDateDayInput.press('Control+A');
    await startDateDayInput.type(newStartDate.format('DD'));

    await startDateMonthInput.click();
    await startDateMonthInput.press('Control+A');
    await startDateMonthInput.type(newStartDate.format('MM'));

    await startDateYearInput.click();
    await startDateYearInput.press('Control+A');
    await startDateYearInput.type(newStartDate.format('YYYY'));

    const startTimeInput = chartPage.page.getByRole('textbox', { name: /start time/i });
    await expect(startTimeInput).toBeVisible();
    await startTimeInput.click();
    await startTimeInput.fill('12:00');
    await chartPage.page.getByLabel(/start time format/i).selectOption('AM');

    const dayText = await startDateDayInput.textContent();
    const monthText = await startDateMonthInput.textContent();
    const yearText = await startDateYearInput.textContent();
    expect(dayText).toBe(newStartDate.format('DD'));
    expect(monthText).toBe(newStartDate.format('MM'));
    expect(yearText).toBe(newStartDate.format('YYYY'));

    await chartPage.page.getByRole('button', { name: /update visit/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(chartPage.page.getByText(/visit details updated/i)).toBeVisible();
  });

  await test.step('And the visit start date should be updated in the backend', async () => {
    const updated = await getVisit(api, visit.uuid);
    const updatedStart = dayjs(updated.startDatetime).format('YYYY-MM-DD');
    const expectedStart = targetStartDate.format('YYYY-MM-DD');
    expect(updatedStart).toBe(expectedStart);
  });
});
