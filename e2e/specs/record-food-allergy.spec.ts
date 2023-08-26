import { test } from '../core';
import { PatientAllergiesPage } from '../pages';
import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, Patient } from '../commands';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('Add Food allergy to patient', async ({ page, api }) => {
  const allergiesPage = new PatientAllergiesPage(page);

  await test.step('When I visit the patient allergies page', async () => {
    await allergiesPage.goto(patient.uuid);
  });

  await test.step('And I click the Record allergy intolerance button', async () => {
    await allergiesPage.page.getByText('Record allergy').click();
  });

  await test.step('Ab=nd I filled the form', async () => {
    await allergiesPage.page.getByText('Food').click();
    await allergiesPage.page.getByText('Eggs').click();
    await allergiesPage.page.getByText('Mental status change').click();
    await allergiesPage.page.getByText('Mild').click();
    await allergiesPage.page.locator('#comments').fill('Test comment');
  });

  await test.step('And I click the save button', async () => {
    await allergiesPage.page.getByText('Save').click();
  });

  await test.step('Then I should see the Allergy Saved notification', async () => {
    await expect(allergiesPage.page.getByText('saved')).toBeVisible();
  });

  await test.step('And I see the recorded allergy data', async () => {
    const rows = await allergiesPage.allergyTable().locator('tr');
    const allergenCell = rows.locator('td:first-child');
    const severityCell = rows.locator('td:nth-child(2)');
    const reactionCell = rows.locator('td:nth-child(3)');
    const commentCell = rows.locator('td:nth-child(4)');
    await expect(allergenCell).toHaveText('Eggs');
    await expect(reactionCell).toHaveText('Mental status change');
    await expect(severityCell).toHaveText('low');
    await expect(commentCell).toHaveText('Test comment');
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
