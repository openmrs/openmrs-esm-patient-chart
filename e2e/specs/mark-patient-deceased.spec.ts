import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, type Patient } from '../commands';
import { test } from '../core';
import { MarkPatientDeceasedPage } from '../pages/mark-patient-deceased-page';
import dayjs from 'dayjs';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('Mark a patient as deceased', async ({ page }) => {
  const markPatientDeceasedPage = new MarkPatientDeceasedPage(page);
  const causeOfDeath = 'Neoplasm';
  const actionsButton = () => page.getByRole('button', { name: /actions/i });
  const markDeceasedMenuItem = () => page.getByRole('menuitem', { name: /mark patient deceased/i });
  const deathDetailsForm = () => page.locator('form');
  const dateOfDeathInput = () => page.getByTestId('deceasedDate');
  const saveAndCloseButton = () => page.getByRole('button', { name: /save and close/i });

  await test.step('Given that I have a patient and I am on the Patient’s chart page', async () => {
    await markPatientDeceasedPage.goTo(patient.uuid);
  });

  await test.step('When I click on the "Actions" button and select "Mark patient deceased"', async () => {
    await actionsButton().click();
    await markDeceasedMenuItem().click();
  });

  await test.step("Then I should see a form to enter the patient's death details", async () => {
    await expect(deathDetailsForm()).toBeVisible();
    await expect(dateOfDeathInput()).toBeVisible();
    await expect(page.getByRole('radio', { name: causeOfDeath })).toBeVisible();
  });

  await test.step('When I enter the "Date of death" to today’s date', async () => {
    const dateOfDeathDayInput = dateOfDeathInput().getByRole('spinbutton', { name: /day/i });

    const dateOfDeathMonthInput = dateOfDeathInput().getByRole('spinbutton', { name: /month/i });
    const dateOfDeathYearInput = dateOfDeathInput().getByRole('spinbutton', { name: /year/i });
    await dateOfDeathDayInput.fill(dayjs().format('DD'));
    await dateOfDeathMonthInput.fill(dayjs().format('MM'));
    await dateOfDeathYearInput.fill(dayjs().format('YYYY'));
    await page.keyboard.press('Enter');
  });

  await test.step('And the "Cause of death" to Neoplasm', async () => {
    await page.locator('text=Neoplasm').click();
  });

  await test.step('And I click "Save and close"', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a “deceased” patient tag in the patient banner', async () => {
    const deceasedTagLocator = page.locator('[data-extension-id="deceased-patient-tag"] span[title="Deceased"]');
    await expect(deceasedTagLocator).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
