import { expect } from '@playwright/test';
import { test } from '../core';
import { ImmunizationsPage } from '../pages';

test('Record, edit and delete an immunization', async ({ page, patient }) => {
  const immunizationsPage = new ImmunizationsPage(page);
  const immunizationsSummaryTable = page.getByRole('table', { name: /immunizations summary/i });
  const immunizationHistoryTable = page.getByRole('table', { name: /immunization history/i });
  const headerRow = immunizationsSummaryTable.locator('thead > tr');
  const historyHeaderRow = immunizationHistoryTable.locator('thead > tr');
  const immunizationType = immunizationsSummaryTable.locator('tbody td:nth-child(2)');
  const vaccinationDate = immunizationsSummaryTable.locator('tbody td:nth-child(3)');

  await test.step('When I navigate to the Immunizations page', async () => {
    await immunizationsPage.goTo(patient.uuid);
  });

  await test.step('And I start recording an immunization', async () => {
    await page.getByRole('button', { name: /record immunizations/i }).click();
  });

  await test.step('Then I should see the immunizations form launch in the workspace', async () => {
    await expect(page.getByText(/immunization form/i)).toBeVisible();
  });

  await test.step('And I set the vaccination date to 08/03/2024', async () => {
    const vaccinationDateInput = page.getByTestId('vaccinationDate');
    await vaccinationDateInput.getByRole('spinbutton', { name: /day/i }).fill('08');
    await vaccinationDateInput.getByRole('spinbutton', { name: /month/i }).fill('03');
    await vaccinationDateInput.getByRole('spinbutton', { name: /year/i }).fill('2024');
  });

  await test.step('And I choose "Hepatitis B vaccination"', async () => {
    await page.getByRole('combobox', { name: /immunization/i }).click();
    await page.getByText(/hepatitis b vaccination/i).click();
  });

  await test.step('And I save the immunization', async () => {
    await page.getByRole('button', { name: /save/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/vaccination saved successfully/i)).toBeVisible();
  });

  await test.step('Then the immunizations history card should have the expected headers', async () => {
    await expect(historyHeaderRow).toContainText(/vaccine/i);
    await expect(historyHeaderRow).toContainText(/doses/i);
  });

  await test.step('And the immunizations history card should have the expected immunization name and dose', async () => {
    await expect(immunizationHistoryTable).toContainText(/hepatitis b vaccination/i);
    await expect(immunizationHistoryTable).toContainText(/dose 1/i);
  });

  await test.step('And the immunizations summary table should have the expected headers', async () => {
    await expect(headerRow).toContainText(/vaccine/i);
    await expect(headerRow).toContainText(/recent vaccination/i);
  });

  await test.step('And the immunizations summary table should show the vaccine name and the last dose date', async () => {
    await expect(immunizationType).toContainText(/hepatitis b vaccination/i);
    await expect(vaccinationDate).toContainText(/last dose on 08-Mar-2024, dose 1/i);
  });

  await test.step('When I expand all rows', async () => {
    await immunizationsSummaryTable.getByRole('button', { name: /expand all rows/i }).click();
  });

  await test.step('Then I should see the expanded immunization details section showing the dose number and vaccination date', async () => {
    await expect(immunizationsSummaryTable.getByText(/dose number within series/i)).toBeVisible();
    await expect(immunizationsSummaryTable.getByText(/vaccination date/i)).toBeVisible();
  });

  await test.step('And I edit the immunization', async () => {
    await immunizationsSummaryTable.getByRole('button', { name: /edit/i }).click();
  });

  await test.step('Then the immunization form should launch in edit mode with the current values pre-filled', async () => {
    await expect(page.getByText(/immunization form/i)).toBeVisible();
  });

  await test.step('Then the vaccine field should show "Hepatitis B vaccination" and be disabled', async () => {
    const vaccineField = page.getByRole('combobox', { name: /immunization/i });
    await expect(vaccineField).toBeDisabled();
    await expect(vaccineField).toHaveText(/hepatitis b vaccination/i);
  });

  await test.step('And I set the vaccination date to 02/01/2025', async () => {
    const vaccinationDateInput = page.getByTestId('vaccinationDate');
    await vaccinationDateInput.getByRole('spinbutton', { name: /day/i }).fill('02');
    await vaccinationDateInput.getByRole('spinbutton', { name: /month/i }).fill('01');
    await vaccinationDateInput.getByRole('spinbutton', { name: /year/i }).fill('2025');
  });

  await test.step('And I set the dose number to 2', async () => {
    const doseNumberInput = page.getByRole('spinbutton', { name: /dose number within series/i });
    await doseNumberInput.clear();
    await doseNumberInput.fill('2');
  });

  await test.step('And I save the changes', async () => {
    await page.getByRole('button', { name: /save/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/vaccination saved successfully/i)).toBeVisible();
  });

  await test.step('And the immunizations history card should show the updated immunization', async () => {
    await expect(immunizationHistoryTable).toContainText(/02-Jan-2025/i);
    await expect(immunizationHistoryTable).toContainText(/dose 2/i);
  });

  await test.step('And the immunizations summary table should show the updated immunization details', async () => {
    await expect(
      immunizationsSummaryTable.getByRole('cell', { name: /last dose on 02-Jan-2025, dose 2/i }),
    ).toBeVisible();
  });

  await test.step('And the expanded section should show the updated values', async () => {
    await expect(immunizationsSummaryTable.getByText(/dose number within series/i)).toBeVisible();
    await expect(immunizationsSummaryTable.getByRole('cell', { name: '2', exact: true })).toBeVisible();
    await expect(immunizationsSummaryTable.getByRole('cell', { name: '02-Jan-2025', exact: true })).toBeVisible();
  });

  await test.step('And when I delete the immunization dose', async () => {
    await immunizationsSummaryTable.getByRole('button', { name: /delete/i }).click();
  });

  await test.step('Then a confirmation modal should appear', async () => {
    await expect(page.getByRole('dialog')).toContainText(/are you sure you want to delete/i);
  });

  await test.step('And when I confirm the deletion', async () => {
    await page.getByRole('button', { name: 'danger Delete' }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/Immunization dose deleted/i)).toBeVisible();
  });

  await test.step('And I should see an empty state tile', async () => {
    await expect(page.getByText(/there are no immunizations to display for this patient/i)).toBeVisible();
  });
});
