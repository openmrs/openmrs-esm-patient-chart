import { test } from '../core';
import { PatientAllergiesPage } from '../pages';
import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, Patient } from '../commands';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('Add drug allergy to patient', async ({ page, api }) => {
  const allergiesPage = new PatientAllergiesPage(page);

  await test.step('When I visit the patient allergies page', async () => {
    await allergiesPage.goto(patient.uuid);
    await expect(allergiesPage.page).toHaveURL(
      `${process.env.E2E_BASE_URL}/spa/patient/${patient.uuid}/chart/Allergies`,
    );
  });
  await test.step('And I add a drug allergy', async () => {
    await allergiesPage.addDrugAllergy();
    await expect(allergiesPage.savedMessage()).toBeVisible();
  });
  await test.step('Then I should see the allergy in the list', async () => {
    await expect(allergiesPage.drugAllergenOption()).toBeVisible();
    await expect(allergiesPage.reactionOption()).toBeVisible();
    await expect(allergiesPage.severityOption()).toBeVisible();
    await expect(allergiesPage.commentMessage()).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
