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

  await test.step('When I go to the Immunizations page', async () => {
    await immunizationsPage.goTo(patient.uuid);
  });

  await test.step('And I click on the `Record immunizations` link', async () => {
    await page.getByRole('button', { name: /record immunizations/i }).click();
  });

  await test.step('Then I should see the Immunization form launch in the workspace', async () => {
    await expect(page.getByText(/immunization form/i)).toBeVisible();
  });

  await test.step('When I set `08/03/2024` as the vaccination date', async () => {
    const vaccinationDateInput = page.getByTestId('vaccinationDate');
    const vaccinationDateDayInput = vaccinationDateInput.getByRole('spinbutton', { name: /day/i });
    const vaccinationDateMonthInput = vaccinationDateInput.getByRole('spinbutton', { name: /month/i });
    const vaccinationDateYearInput = vaccinationDateInput.getByRole('spinbutton', { name: /year/i });
    await vaccinationDateDayInput.fill('08');
    await vaccinationDateMonthInput.fill('03');
    await vaccinationDateYearInput.fill('2024');
  });

  await test.step('And I set `Hepatitis B vaccination` as the immunization', async () => {
    await page.getByRole('combobox', { name: /immunization/i }).click();
    await page.getByText(/hepatitis b vaccination/i).click();
  });

  await test.step('And I click on the `Save` button', async () => {
    await page.getByRole('button', { name: /save/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/vaccination saved successfully/i)).toBeVisible();
  });

  await test.step('And I should see the newly recorded immunization in the list', async () => {
    await expect(headerRow).toContainText(/vaccine/i);
    await expect(headerRow).toContainText(/recent vaccination/i);
    await expect(immunizationType).toContainText(/hepatitis b vaccination/i);
    await expect(vaccinationDate).toContainText(/mar 8, 2024/i);
  });

  await test.step('When I click the expand All rows in the table header with the newly recorded immunization', async () => {
    await page.getByRole('button', { name: /expand all rows/i }).click();
  });

  await test.step('Then I should see the immunization saved row in the table', async () => {
    await expect(page.getByText(/dose number within series/i)).toBeVisible();
    await expect(page.getByText(/vaccination date/i)).toBeVisible();
  });

  await test.step('And I click on the `Edit` button', async () => {
    await page.getByRole('button', { name: /edit/i }).click();
  });

  await test.step('Then I should see the immunization form launch in the workspace in edit mode`', async () => {
    await expect(page.getByText(/immunization form/i)).toBeVisible();
    await expect(page.getByRole('cell', { name: /hepatitis b vaccination/i })).toBeVisible();
  });

  await test.step('When I change the immunization type to `measles vaccination`', async () => {
    await page.getByRole('combobox', { name: /immunization/i }).click();
    await page.getByText(/measles vaccination/i).click();
  });

  await test.step('And I change `08/03/2024` to `02/01/2025` as the updated vaccination date', async () => {
    await page.getByLabel(/vaccination date/i).clear();
    await page.getByLabel(/vaccination date/i).fill('02/01/2025');
    await page.getByLabel(/vaccination date/i).press('Tab');
  });

  await test.step('And I change the immunization Dose number within series to `2`', async () => {
    await page.getByRole('spinbutton', { name: /dose number within series/i }).clear();
    await page.getByRole('spinbutton', { name: /dose number within series/i }).fill('2');
  });

  await test.step('And I click on the `Save` button', async () => {
    await page.getByRole('button', { name: /save/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/vaccination saved successfully/i)).toBeVisible();
  });

  await test.step('Then I attempt to click the Collapse All Rows button in the table header if visible', async () => {
    const collapseButton = page.getByRole('button', { name: /collapse all rows/i });
    if (await collapseButton.isVisible()) await collapseButton.click();
  });

  await test.step('And I should see the updated immunization in the list', async () => {
    await expect(page.getByRole('columnheader', { name: /vaccine/i })).toContainText(/vaccine/i);
    await expect(page.getByText(/recent vaccination/i)).toBeVisible();
    await expect(page.getByRole('cell', { name: /measles vaccination/i })).toBeVisible();
  });

  await test.step('When I attempt to click the expand All rows in the table header with the updated recorded immunization if visible', async () => {
    const expandButton = page.getByRole('button', { name: /expand all rows/i });
    if (await expandButton.isVisible()) await expandButton.click();
  });

  await test.step('Then I should see the immunization updated Dose number saved row in the table as `2`', async () => {
    await expect(page.getByText(/dose number within series/i)).toBeVisible();
    await expect(page.getByRole('cell', { name: '2', exact: true })).toBeVisible();
  });

  await test.step('And I should see the immunization updated date saved row in the table as `02-Jan-2025`', async () => {
    await expect(page.getByText(/vaccination date/i)).toBeVisible();
    await expect(page.getByRole('cell', { name: '02-Jan-2025', exact: true })).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
