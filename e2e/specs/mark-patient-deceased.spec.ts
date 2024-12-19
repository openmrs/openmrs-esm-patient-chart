import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, type Patient } from '../commands';
import { test } from '../core';
import { MarkPatientDeceasedPage } from '../pages/mark-patient-deceased-page';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('Mark a patient as deceased', async ({ page }) => {
  const markPatientDeceasedPage = new MarkPatientDeceasedPage(page);
  const todayDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  const causeOfDeath = 'Neoplasm';

  // Locators
  const actionsButton = () => page.getByRole('button', { name: /actions/i });
  const markDeceasedMenuItem = () => page.getByRole('menuitem', { name: /mark patient deceased/i });
  const deathDetailsForm = () => page.locator('form');
  const dateOfDeathInput = () => page.getByPlaceholder(/dd\/mm\/yyyy/i);
  const saveAndCloseButton = () => page.getByRole('button', { name: /save and close/i });
  const deceasedTag = () =>
    page.locator('[data-extension-id="deceased-patient-tag"] span', { hasText: 'Deceased' });

  // Given that I have a patient and I am on the Patient’s chart page
  await test.step('Given that I have a patient and I am on the Patient’s chart page', async () => {
    const patientChartPath = markPatientDeceasedPage.getPatientChartPath(patient.uuid);
    await page.goto(patientChartPath);
  });

  // When I click on the "Actions" button and select "Mark patient deceased"
  await test.step('When I click on the "Actions" button and select "Mark patient deceased"', async () => {
    await actionsButton().click();
    await markDeceasedMenuItem().click();
  });

  // Then I should see a form to enter the patient's death details
  await test.step('Then I should see a form to enter the patient\'s death details', async () => {
    await expect(deathDetailsForm()).toBeVisible();
    await expect(dateOfDeathInput()).toBeVisible();
    await expect(page.getByRole('radio', { name: causeOfDeath })).toBeVisible();
  });

  // When I add all the death details and save
  await test.step('When I enter the "Date of death" to today’s date and the "Cause of death" to Neoplasm and click "Save and close"', async () => {
    // Fill the date input
    await dateOfDeathInput().fill(todayDate);

    // Close the date picker if still open
    await page.keyboard.press('Enter'); // Ensure the date picker closes

    // Wait for the "Neoplasm" radio button to be visible and select it
    await page.locator('text=Neoplasm').waitFor({ state: 'visible' });
    await page.locator('text=Neoplasm').click();

    // Save and close
    await saveAndCloseButton().click();
  });

  // Then I should see a “deceased” patient tag in the patient banner
  await test.step('Then I should see a “deceased” patient tag in the patient banner', async () => {
    const deceasedTagLocator = page.locator(
      '[data-extension-id="deceased-patient-tag"] span[title="Deceased"]'
    );
    
    await expect(deceasedTagLocator).toBeVisible({ timeout: 70000 });
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
