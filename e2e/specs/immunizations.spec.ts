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

  await test.step('And I click the Record immunizations button', async () => {
    await page.getByRole('button', { name: /record immunizations/i }).click();
  });

  await test.step('Then I should see the Immunization form in the workspace', async () => {
    await expect(page.getByText(/immunization form/i)).toBeVisible();
  });

  await test.step('And I enter 08/03/2024 as the vaccination date', async () => {
    const vaccinationDateInput = page.getByTestId('vaccinationDate');
    await vaccinationDateInput.getByRole('spinbutton', { name: /day/i }).fill('08');
    await vaccinationDateInput.getByRole('spinbutton', { name: /month/i }).fill('03');
    await vaccinationDateInput.getByRole('spinbutton', { name: /year/i }).fill('2024');
  });

  await test.step('And I select Hepatitis B vaccination from the immunization dropdown', async () => {
    await page.getByRole('combobox', { name: /immunization/i }).click();
    await page.getByText(/hepatitis b vaccination/i).click();
  });

  await test.step('And I click the Save button', async () => {
    await page.getByRole('button', { name: /save/i }).click();
  });

  await test.step('Then I should see a success notification for the saved vaccination', async () => {
    await expect(page.getByText(/vaccination saved successfully/i)).toBeVisible();
  });

  await test.step('Then I should see the immunizations History card with correct headers', async () => {
    await expect(historyHeaderRow).toContainText(/vaccine/i);
    await expect(historyHeaderRow).toContainText(/doses/i);
  });

  await test.step('And I should see a row with the correct immunization name and dose', async () => {
    await expect(immunizationHistoryTable).toContainText(/hepatitis b vaccination/i);
    await expect(immunizationHistoryTable).toContainText(/dose 1/i);
  });

  await test.step('And I should see the immunizations summary table with correct headers', async () => {
    await expect(headerRow).toContainText(/vaccine/i);
    await expect(headerRow).toContainText(/recent vaccination/i);
  });

  await test.step('And I should see the a table row with the correct immunization details', async () => {
    await expect(immunizationType).toContainText(/hepatitis b vaccination/i);
    await expect(vaccinationDate).toContainText(/last dose on 08-Mar-2024, dose 1/i);
  });

  await test.step('When I click the Expand all rows button', async () => {
    await immunizationsSummaryTable.getByRole('button', { name: /expand all rows/i }).click();
  });

  await test.step('Then I should see the expanded immunization details section', async () => {
    await expect(immunizationsSummaryTable.getByText(/dose number within series/i)).toBeVisible();
    await expect(immunizationsSummaryTable.getByText(/vaccination date/i)).toBeVisible();
  });

  await test.step('And I click the Edit button for the immunization', async () => {
    await immunizationsSummaryTable.getByRole('button', { name: /edit/i }).click();
  });

  await test.step('Then I should see the immunization form in edit mode with the current values', async () => {
    await expect(page.getByText(/immunization form/i)).toBeVisible();
  });

  await test.step('Then the vaccine dropdown should show Hepatitis B vaccination and be disabled', async () => {
    const dropdown = page.getByRole('combobox', { name: /immunization/i });
    await expect(dropdown).toBeDisabled();
    await expect(dropdown).toHaveText(/hepatitis b vaccination/i);
  });

  await test.step('And I enter the vaccination date as 02/01/2025', async () => {
    const vaccinationDateInput = page.getByTestId('vaccinationDate');
    await vaccinationDateInput.getByRole('spinbutton', { name: /day/i }).fill('02');
    await vaccinationDateInput.getByRole('spinbutton', { name: /month/i }).fill('01');
    await vaccinationDateInput.getByRole('spinbutton', { name: /year/i }).fill('2025');
  });

  await test.step('And I enter the dose number as 2', async () => {
    const doseNumberInput = page.getByRole('spinbutton', { name: /dose number within series/i });
    await doseNumberInput.clear();
    await doseNumberInput.fill('2');
  });

  await test.step('And I click the Save button', async () => {
    await page.getByRole('button', { name: /save/i }).click();
  });

  await test.step('Then I should see a success notification for the updated vaccination', async () => {
    await expect(page.getByText(/vaccination saved successfully/i)).toBeVisible();
  });

  await test.step('And I should see the updated immunization in the History card', async () => {
    await expect(immunizationHistoryTable).toContainText(/02-Jan-2025/i);
    await expect(immunizationHistoryTable).toContainText(/dose 2/i);
  });

  await test.step('And I should see the updated immunization details in the table', async () => {
    await expect(
      immunizationsSummaryTable.getByRole('cell', { name: /last dose on 02-Jan-2025, dose 2/i }),
    ).toBeVisible();
  });

  await test.step('And expanding the details section should show the correct updated information', async () => {
    await expect(immunizationsSummaryTable.getByText(/dose number within series/i)).toBeVisible();
    await expect(immunizationsSummaryTable.getByRole('cell', { name: '2', exact: true })).toBeVisible();
    await expect(immunizationsSummaryTable.getByRole('cell', { name: '02-Jan-2025', exact: true })).toBeVisible();
  });

  await test.step('And I click the Delete button', async () => {
    await immunizationsSummaryTable.getByRole('button', { name: /delete/i }).click();
  });

  await test.step('Then a confirmation modal should open', async () => {
    await expect(page.getByRole('dialog')).toContainText(/are you sure you want to delete/i);
  });

  await test.step('And I click delete', async () => {
    await page.getByRole('button', { name: 'danger Delete' }).click();
  });

  await test.step('Then I should see a success notification for the deleted vaccination', async () => {
    await expect(page.getByText(/Immunization dose deleted/i)).toBeVisible();
  });

  await test.step('And I should see There are no immunizations to display for this patient', async () => {
    await expect(page.getByText(/there are no immunizations to display for this patient/i)).toBeVisible();
  });
});
