import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, type Patient } from '../commands';
import { test } from '../core';
import { MarkPatientDeceasedPage } from '../pages';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('Mark a patient as deceased', async ({ page }) => {
  const markPatientDeceasedPage = new MarkPatientDeceasedPage(page);
  const todayDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  const causeOfDeath = 'Neoplasm';

  await test.step('Given that I have a patient and I am on the Patient’s chart page', async () => {
    await markPatientDeceasedPage.goToPatientChart(patient.uuid);
  });

  await test.step('When I click on the "Actions" button and select "Mark patient deceased"', async () => {
    await markPatientDeceasedPage.openMarkDeceasedForm();
  });

  await test.step('Then I should see a form to enter the patient\'s death details', async () => {
    await expect(markPatientDeceasedPage.deathDetailsForm()).toBeVisible();
    await expect(markPatientDeceasedPage.dateOfDeathInput()).toBeVisible();
    await expect(markPatientDeceasedPage.causeOfDeathRadio(causeOfDeath)).toBeVisible();
  });

  await test.step('When I enter the "Date of death" to today\'s date, "Cause of death" to Neoplasm, and click "Save and close"', async () => {
    await markPatientDeceasedPage.fillDeathDetails(todayDate, causeOfDeath);
    await markPatientDeceasedPage.saveAndClose();
  });

  await test.step('Then I should see a “deceased” patient tag in the patient banner', async () => {
    await markPatientDeceasedPage.verifyDeceasedTag();
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
