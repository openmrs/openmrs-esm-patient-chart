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
  });

  await test.step('And I click the Record allergy intolerance button', async () => {
    await allergiesPage.page.getByText('Record allergy').click();
  });

  await test.step('And I filled the form', async () => {
    await allergiesPage.page.getByText('ACE inhibitors').click();
    await allergiesPage.page.getByText('Mental status change').click();
    await allergiesPage.page.getByText('Mild').click();
    await allergiesPage.page.locator('#comments').fill('Test comment');
  });

  await test.step('And I submit the form', async () => {
    await allergiesPage.page.getByText('Save').click();
  });

  await test.step('Then I see the Allergy Saved message', async () => {
    await expect(allergiesPage.page.getByText('saved')).toBeVisible();
  });

  await test.step('Then I see the data of the allergy that I saved', async () => {
    const rows = allergiesPage.allergyTable().locator('tr');
    const allergenCell = rows.locator('td:first-child');
    const severityCell = rows.locator('td:nth-child(2)');
    const reactionCell = rows.locator('td:nth-child(3)');
    const commentCell = rows.locator('td:nth-child(4)');
    await expect(allergenCell.getByText('ACE inhibitors')).toBeVisible();
    await expect(reactionCell.getByText('Mental status change')).toBeVisible();
    await expect(severityCell.getByText('LOW')).toBeVisible();
    await expect(commentCell.getByText('Test comment')).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
