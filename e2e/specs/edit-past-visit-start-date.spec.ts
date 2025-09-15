import { expect } from '@playwright/test';
import dayjs from 'dayjs';
import { getVisit, endVisit, visitStartDatetime } from '../commands';
import { test } from '../core';
import { ChartPage, VisitsPage } from '../pages';

test('Edit start date of a past visit', async ({ page, api, patient, visit }) => {
  const chartPage = new ChartPage(page);
  const visitsPage = new VisitsPage(page);

  // Ensure the visit is a past (ended) visit
  await test.step('Given the current visit is ended (past visit)', async () => {
    await endVisit(api, visit);
  });

  await test.step('When I navigate to the Visits page', async () => {
    await visitsPage.goTo(patient.uuid);
  });

  await test.step('And I click Edit on the past visit', async () => {
    await visitsPage.page.getByRole('button', { name: /edit/i }).click();
  });

  await test.step('Then I see the Edit Visit form with visit status tabs', async () => {
    await expect(visitsPage.page.getByRole('tab', { name: /ongoing/i })).toBeVisible();
    await expect(visitsPage.page.getByRole('tab', { name: /ended/i })).toBeVisible();
  });

  await test.step('When I change the visit start date to two days ago', async () => {
    const newStartDate = visitStartDatetime.subtract(1, 'day'); // original was yesterday; set to two days ago

    // Switch to the Ongoing tab where start date is editable
    await visitsPage.page.getByRole('tab', { name: /ongoing/i }).click();

    // Ensure the date input is visible
    await expect(chartPage.page.getByTestId('visitStartDateInput')).toBeVisible();

    const startDateInput = chartPage.page.getByTestId('visitStartDateInput');
    const startDateDayInput = startDateInput.getByRole('spinbutton', { name: /day/i });
    const startDateMonthInput = startDateInput.getByRole('spinbutton', { name: /month/i });
    const startDateYearInput = startDateInput.getByRole('spinbutton', { name: /year/i });

    await startDateDayInput.fill(newStartDate.format('DD'));
    await startDateMonthInput.fill(newStartDate.format('MM'));
    await startDateYearInput.fill(newStartDate.format('YYYY'));

    // Submit the update
    await chartPage.page.getByRole('button', { name: /update visit/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(chartPage.page.getByText(/visit details updated/i)).toBeVisible();
  });

  await test.step('And the visit start date should be updated in the backend', async () => {
    const updated = await getVisit(api, visit.uuid);
    const updatedStart = dayjs(updated.startDatetime).format('YYYY-MM-DD');
    const expectedStart = visitStartDatetime.subtract(1, 'day').format('YYYY-MM-DD');
    expect(updatedStart).toBe(expectedStart);
  });
});
