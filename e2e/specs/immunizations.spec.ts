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

test('Add an immunization', async ({ page }) => {
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
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
