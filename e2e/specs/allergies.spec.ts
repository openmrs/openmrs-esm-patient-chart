import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, type Patient } from '../commands';
import { test } from '../core';
import { PatientAllergiesPage } from '../pages';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('Add, edit and delete an allergy', async ({ page }) => {
  const allergiesPage = new PatientAllergiesPage(page);
  const headerRow = allergiesPage.allergiesTable().locator('thead > tr');
  const dataRow = allergiesPage.allergiesTable().locator('tbody > tr');

  await test.step('When I visit the Allergies page', async () => {
    await allergiesPage.goTo(patient.uuid);
  });

  await test.step('And I click on the `Record allergy intolerance` link to launch the form', async () => {
    await page.getByText(/record allergy intolerance/i).click();
  });

  await test.step('Then I should see the record allergy form launch in the workspace', async () => {
    await expect(page.getByText(/record a new allergy/i)).toBeVisible();
  });

  await test.step('When I select `ACE inhibitors` as the allergy', async () => {
    await page.getByPlaceholder(/select the allergen/i).click();
    await page.getByText(/ace inhibitors/i).click();
  });

  await test.step('And I select `Mental status change` as the reaction', async () => {
    await page.getByText(/mental status change/i).click();
  });

  await test.step('And I select `Mild` as the severity', async () => {
    await page.getByText(/mild/i).click();
  });

  await test.step('And I add a comment for the allergy', async () => {
    await page.locator('#comments').fill('Feeling faint and light-headed');
  });

  await test.step('And I click on the `Save and close` button', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/allergy saved/i)).toBeVisible();
  });

  await test.step('And I should see the newly recorded drug allergen in the list', async () => {
    await expect(headerRow).toContainText(/allergen/i);
    await expect(headerRow).toContainText(/severity/i);
    await expect(headerRow).toContainText(/reaction/i);
    await expect(headerRow).toContainText(/comments/i);
    await expect(dataRow).toContainText(/ace inhibitors/i);
    await expect(dataRow).toContainText(/mild/i);
    await expect(dataRow).toContainText(/mental status change/i);
    await expect(dataRow).toContainText(/feeling faint and light-headed/i);
  });

  await test.step('When I click the overflow menu in the table row with the newly added allergy', async () => {
    await page
      .getByRole('button', { name: /options/i })
      .nth(0)
      .click();
  });

  await test.step('And I click on the `Edit` button', async () => {
    await page.getByRole('menuitem', { name: /edit/i }).click();
  });

  await test.step('Then I should see the allergy form launch in the workspace in edit mode`', async () => {
    await expect(page.getByText(/edit an allergy/i)).toBeVisible();
    await expect(page.getByText(/ace inhibitors/i)).toBeVisible();
  });

  await test.step('When I change the allergy to `Bee stings`', async () => {
    await page.getByPlaceholder(/select the allergen/i).click();
    await page.getByText(/bee stings/i).click();
  });

  await test.step('And I change the severity to `Severe`', async () => {
    await page.getByText(/severe/i).click();
  });

  await test.step('And I change the allergy comment to `Itching all over the body`', async () => {
    await page.locator('#comments').clear();
    await page.locator('#comments').fill('Itching all over the body');
  });

  await test.step('And I click on the `Save and close` button', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/allergy updated/i)).toBeVisible();
  });

  await test.step('And I should see the updated allergy in the list', async () => {
    await expect(headerRow).toContainText(/allergen/i);
    await expect(headerRow).toContainText(/severity/i);
    await expect(headerRow).toContainText(/reaction/i);
    await expect(headerRow).toContainText(/comments/i);
    await expect(dataRow).toContainText(/bee stings/i);
    await expect(dataRow).not.toContainText(/ace inhibitors/i);
    await expect(dataRow).toContainText(/severe/i);
    await expect(dataRow).not.toContainText(/mild/i);
    await expect(dataRow).toContainText(/itching all over the body/i);
    await expect(dataRow).not.toContainText(/feeling faint and light-headed/i);
  });

  await test.step('When I click the overflow menu in the table row with the updated allergy', async () => {
    await page
      .getByRole('button', { name: /options/i })
      .nth(0)
      .click();
  });

  await test.step('And I click on the `Delete` button', async () => {
    await page.getByRole('menuitem', { name: /delete/i }).click();
    await page.getByRole('button', { name: /delete/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/allergy deleted/i)).toBeVisible();
  });

  await test.step('And I should not see the deleted allergy in the list', async () => {
    await expect(page.getByText(/bee stings/i)).not.toBeVisible();
  });

  await test.step('And the allergy table should be empty', async () => {
    await expect(page.getByText(/there are no allergy intolerances to display for this patient/i)).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
