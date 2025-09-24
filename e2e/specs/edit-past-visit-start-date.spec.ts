import dayjs from 'dayjs';
import { expect } from '@playwright/test';
import { getVisit, endVisit, visitStartDatetime } from '../commands';
import { test } from '../core';
import { VisitsPage } from '../pages';

test('Edit start date of a past visit', async ({ page, api, patient, visit }) => {
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
    await visitsPage.page.getByRole('tab', { name: /ongoing/i }).click();
    await expect(visitsPage.page.getByRole('button', { name: /update visit/i })).toBeVisible();
    await expect(visitsPage.page.getByTestId('visitStartDateInput')).toBeVisible();

    const startDateInput = visitsPage.page.getByTestId('visitStartDateInput');
    const startDateDayInput = startDateInput.getByRole('spinbutton', { name: /day/i });
    const startDateMonthInput = startDateInput.getByRole('spinbutton', { name: /month/i });
    const startDateYearInput = startDateInput.getByRole('spinbutton', { name: /year/i });

    await startDateDayInput.fill(targetStartDate.format('DD'));
    await startDateMonthInput.fill(targetStartDate.format('MM'));
    await startDateYearInput.fill(targetStartDate.format('YYYY'));

    const startTimeInput = visitsPage.page.getByRole('textbox', { name: /start time/i });
    await expect(startTimeInput).toBeVisible();
    await startTimeInput.fill('12:00');
    await visitsPage.page.getByLabel(/start time format/i).selectOption('AM');

    const dayText = await startDateDayInput.textContent();
    const monthText = await startDateMonthInput.textContent();
    const yearText = await startDateYearInput.textContent();
    expect(dayText).toBe(targetStartDate.format('DD'));
    expect(monthText).toBe(targetStartDate.format('MM'));
    expect(yearText).toBe(targetStartDate.format('YYYY'));
    await visitsPage.page.keyboard.press('Enter');

    await visitsPage.page.getByRole('button', { name: /update visit/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(visitsPage.page.getByText(/visit details updated/i)).toBeVisible();
  });

  await test.step('And the visit start date should be updated in the backend', async () => {
    const updated = await getVisit(api, visit.uuid);
    const updatedStart = dayjs(updated.startDatetime).format('YYYY-MM-DD');
    const expectedStart = targetStartDate.format('YYYY-MM-DD');
    expect(updatedStart).toBe(expectedStart);
  });
});
