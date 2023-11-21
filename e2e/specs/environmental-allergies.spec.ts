import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, Patient } from '../commands';
import { test } from '../core';
import { PatientAllergiesPage } from '../pages';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('Record an allergy to an environmental factors', async ({ page, api }) => {
  const allergiesPage = new PatientAllergiesPage(page);
  const headerRow = allergiesPage.allergiesTable().locator('thead > tr');
  const dataRow = allergiesPage.allergiesTable().locator('tbody > tr');

  await test.step('When I visit the Allergies page', async () => {
    await allergiesPage.goTo(patient.uuid);
  });

  await test.step('And I click the `Record allergy intolerance` link to launch the form', async () => {
    await allergiesPage.page.getByText(/record allergy intolerance/i).click();
  });

  await test.step('And I record an allergy to an environmental factor', async () => {
    await allergiesPage.page.getByRole('tab', { name: /environmental/i }).click();
    await allergiesPage.page.getByText('Dust').click();
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

  await test.step('And I should see the newly recorded environmental allergy in the list', async () => {
    await expect(headerRow).toContainText(/allergen/i);
    await expect(headerRow).toContainText(/severity/i);
    await expect(headerRow).toContainText(/reaction/i);
    await expect(headerRow).toContainText(/onset date and comments/i);
    await expect(dataRow).toContainText(/dust/i);
    await expect(dataRow).toContainText(/low/i);
    await expect(dataRow).toContainText(/mental status change/i);
    await expect(dataRow).toContainText(/test comment/i);
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
