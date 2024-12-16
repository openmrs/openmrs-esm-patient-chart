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
  const causeOfDeath = 'Neoplasm/cancer';

  await test.step('When I go to the Patient’s chart page', async () => {
    await markPatientDeceasedPage.goToPatientChart(patient.uuid);
  });

  await test.step('And I select "Mark patient deceased" from the Actions menu', async () => {
    await markPatientDeceasedPage.openMarkDeceasedForm();
  });

  await test.step('Then I should see a form to enter death details', async () => {
    await expect(markPatientDeceasedPage.deathDetailsForm()).toBeVisible();
    await expect(markPatientDeceasedPage.dateOfDeathInput()).toBeVisible();
    await expect(markPatientDeceasedPage.causeOfDeathRadio(causeOfDeath)).toBeVisible();
  });

  await test.step('When I add all the death details and save', async () => {
    await markPatientDeceasedPage.fillDeathDetails(todayDate, causeOfDeath);
    await markPatientDeceasedPage.saveAndClose();
  });

  await test.step('Then I should see a “deceased” tag in the patient banner', async () => {
    await markPatientDeceasedPage.verifyDeceasedTag();
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
