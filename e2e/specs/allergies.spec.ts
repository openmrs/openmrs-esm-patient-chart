import { expect } from '@playwright/test';
import { test } from '../core';
import { PatientAllergiesPage } from '../pages';

test('Add, edit and delete an allergy', async ({ page, patient }) => {
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
    await page.getByRole('combobox', { name: /allergen/i }).click();
    await page.getByText(/ace inhibitors/i).click();
  });

  await test.step('And I select `Mental status change` as the reaction', async () => {
    await page
      .getByTestId('allergic-reactions-container')
      .getByText(/mental status change/i)
      .click();
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

  await test.step('And if I change the reaction to `Cough` and `Rash`', async () => {
    await page.getByText(/cough/i).click();
    await page.getByText(/rash/i).click();
  });

  await test.step('And I change the severity to `Moderate`', async () => {
    await page.getByText(/moderate/i).click();
  });

  await test.step('And I change the comment', async () => {
    await page.locator('#comments').clear();
    await page
      .locator('#comments')
      .fill(
        'Patient developed a persistent dry, tickly cough after starting lisinopril. No shortness of breath or swelling. Cough interferes with sleep and daily activities. Considering alternative antihypertensive therapy. Rash improving after discontinuing lisinopril.',
      );
  });

  await test.step('And then click the `Save and close` button', async () => {
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
    await expect(dataRow).toContainText(/ace inhibitors/i);
    await expect(dataRow).toContainText(/moderate/i);
    await expect(dataRow).toContainText(/cough/i);
    await expect(dataRow).toContainText(/rash/i);
    await expect(dataRow).toContainText(
      /patient developed a persistent dry, tickly cough after starting lisinopril. no shortness of breath or swelling. cough interferes with sleep and daily activities. considering alternative antihypertensive therapy. rash improving after discontinuing lisinopril./i,
    );
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
    await expect(page.getByText(/ace inhibitors/i)).toBeHidden();
  });

  await test.step('And the allergy table should be empty', async () => {
    await expect(page.getByText(/there are no allergy intolerances to display for this patient/i)).toBeVisible();
  });
});
