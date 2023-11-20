import { test } from '../core';
import { PatientAllergiesPage } from '../pages';
import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, Patient } from '../commands';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('Record an allergy to a food item', async ({ page, api }) => {
  const allergiesPage = new PatientAllergiesPage(page);

  await test.step('When I visit the Allergies page', async () => {
    await allergiesPage.goTo(patient.uuid);
  });

  await test.step('And I click the `Record allergy intolerance` link to launch the form', async () => {
    await allergiesPage.page.getByText(/record allergy intolerance/i).click();
  });

  await test.step('And then I record an allergy to a food item', async () => {
    await allergiesPage.page.getByRole('tab', { name: /food/i }).click();
    await allergiesPage.page.getByText('Eggs').click();
    await allergiesPage.page.getByText('Mental status change').click();
    await allergiesPage.page.getByText('Mild').click();
    await allergiesPage.page.locator('#comments').fill('Test comment');
  });

  await test.step('And I click the submit button', async () => {
    await allergiesPage.page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success toast notification', async () => {
    await expect(allergiesPage.page.getByText(/allergy saved/i)).toBeVisible();
  });

  await test.step('And I should see the newly recorded food allergy in the list', async () => {
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
