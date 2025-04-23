import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import { generateRandomPatient, type Patient, startVisit, deletePatient } from '../commands';
import { test } from '../core';
import { ImmunizationsPage } from '../pages';

let patient: Patient;
let visit: Visit;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
});

test('Add and edit an immunization', async ({ page }) => {
  const immunizationsPage = new ImmunizationsPage(page);
  const headerRow = immunizationsPage.immunizationsTable().locator('thead > tr');
  const immunizationType = immunizationsPage.immunizationsTable().locator('tbody td:nth-child(2)');
  const vaccinationDate = immunizationsPage.immunizationsTable().locator('tbody td:nth-child(3)');

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
    const vaccinationDateDayInput = vaccinationDateInput.getByRole('spinbutton', { name: /day/i });
    const vaccinationDateMonthInput = vaccinationDateInput.getByRole('spinbutton', { name: /month/i });
    const vaccinationDateYearInput = vaccinationDateInput.getByRole('spinbutton', { name: /year/i });
    await vaccinationDateDayInput.fill('08');
    await vaccinationDateMonthInput.fill('03');
    await vaccinationDateYearInput.fill('2024');
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

  await test.step('And I should see the immunization table with the correct headers', async () => {
    await expect(headerRow).toContainText(/vaccine/i);
    await expect(headerRow).toContainText(/recent vaccination/i);
  });

  await test.step('And I should see the new immunization entry with the correct details', async () => {
    await expect(immunizationType).toContainText(/hepatitis b vaccination/i);
    await expect(vaccinationDate).toContainText(/single dose on 08-Mar-2024/i);
  });

  await test.step('When I click the Expand all rows button', async () => {
    await page.getByRole('button', { name: /expand all rows/i }).click();
  });

  await test.step('Then I should see the expanded immunization details section', async () => {
    await expect(page.getByText(/dose number within series/i)).toBeVisible();
    await expect(page.getByText(/vaccination date/i)).toBeVisible();
  });

  await test.step('And I click the Edit button for the immunization', async () => {
    await page.getByRole('button', { name: /edit/i }).click();
  });

  await test.step('Then I should see the immunization form in edit mode with the current values', async () => {
    await expect(page.getByText(/immunization form/i)).toBeVisible();
    await expect(page.getByRole('cell', { name: /hepatitis b vaccination/i })).toBeVisible();
  });

  await test.step('And I select Measles vaccination from the immunization dropdown', async () => {
    await page.getByRole('combobox', { name: /immunization/i }).click();
    await page.getByText(/measles vaccination/i).click();
  });

  await test.step('And I enter the vaccination date as 02/01/2025', async () => {
    const vaccinationDateInput = page.getByTestId('vaccinationDate');
    const vaccinationDateDayInput = vaccinationDateInput.getByRole('spinbutton', { name: /day/i });
    const vaccinationDateMonthInput = vaccinationDateInput.getByRole('spinbutton', { name: /month/i });
    const vaccinationDateYearInput = vaccinationDateInput.getByRole('spinbutton', { name: /year/i });
    await vaccinationDateDayInput.fill('02');
    await vaccinationDateMonthInput.fill('01');
    await vaccinationDateYearInput.fill('2025');
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

  await test.step('When I click the Collapse current row button', async () => {
    const collapseButton = page.getByRole('button', { name: /collapse all rows/i });
    await collapseButton.click();
  });

  await test.step('Then I should see the updated immunization in the collapsed table view', async () => {
    await expect(page.getByRole('columnheader', { name: /vaccine/i })).toContainText(/vaccine/i);
    await expect(page.getByText(/recent vaccination/i)).toBeVisible();
    await expect(page.getByRole('cell', { name: /measles vaccination/i })).toBeVisible();
  });

  await test.step('When I click the Expand current row button', async () => {
    await page.getByRole('button', { name: /expand current row/i }).click();
  });

  await test.step('Then I should see the updated immunization details in the expanded view', async () => {
    await expect(page.getByText(/dose number within series/i)).toBeVisible();
    await expect(page.getByRole('cell', { name: '2', exact: true })).toBeVisible();
    await expect(page.getByText(/vaccination date/i)).toBeVisible();
    await expect(page.getByRole('cell', { name: '02-Jan-2025', exact: true })).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
