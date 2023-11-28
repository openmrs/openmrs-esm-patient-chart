import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, type Patient } from '../commands';
import { test } from '../core';
import { ConditionsPage } from '../pages';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('Record, edit and delete a condition', async ({ page, api }) => {
  const conditionsPage = new ConditionsPage(page);
  const headerRow = conditionsPage.conditionsTable().locator('thead > tr');
  const dataRow = conditionsPage.conditionsTable().locator('tbody > tr');

  await test.step('When I go to the Conditions page', async () => {
    await conditionsPage.goTo(patient.uuid);
  });

  await test.step('And I click on the `Record conditions` button', async () => {
    await conditionsPage.page.getByText(/record conditions/i).click();
  });

  await test.step('And I fill the form', async () => {
    await page.getByPlaceholder(/search conditions/i).fill('mental');
    await page.getByRole('menuitem', { name: 'Mental status change' }).click();
    await page.getByLabel(/onset date/i).fill('10/07/2023');
    await page.getByLabel(/onset date/i).press('Tab');
  });

  await test.step('And I save the form', async () => {
    await page.getByRole('button', { name: /save & close/i }).click();
  });

  await test.step('Then I should see a success toast notification', async () => {
    await expect(conditionsPage.page.getByText(/condition saved/i)).toBeVisible();
  });

  await test.step('And I should see the new condition added to the list', async () => {
    await expect(headerRow).toContainText(/condition/i);
    await expect(headerRow).toContainText(/date of onset/i);
    await expect(headerRow).toContainText(/status/i);
    await expect(dataRow).toContainText(/mental status change/i);
    await expect(dataRow).toContainText(/jul 2023/i);
    await expect(dataRow).toContainText(/active/i);
  });

  await test.step('Then if I click on the overflow menu and click the `Edit` button', async () => {
    await expect(conditionsPage.page.getByRole('button', { name: /options/i })).toBeVisible();
    await conditionsPage.page.getByRole('button', { name: /options/i }).click();
    await expect(conditionsPage.page.getByRole('menu', { name: /edit or delete condition/i })).toBeVisible();
    await conditionsPage.page.getByRole('menuitem', { name: /edit/i }).click();
  });

  await test.step('And I edit the condition', async () => {
    await page.locator('label').filter({ hasText: 'Inactive' }).click();
    await page.getByLabel(/end date/i).fill('11/07/2023');
    await page.getByLabel(/end date/i).press('Tab');
  });

  await test.step('And I save the form', async () => {
    await page.getByRole('button', { name: /save & close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(conditionsPage.page.getByText(/condition updated/i)).toBeVisible();
  });

  await test.step('And I should see the updated condition in the list', async () => {
    await page.getByRole('combobox', { name: /show/i }).click();
    await page.getByText(/all/i).click();

    await expect(dataRow).toContainText(/mental status change/i);
    await expect(dataRow).toContainText(/jul 2023/i);
    await expect(dataRow).toContainText(/inactive/i);
  });

  await test.step('And if I click the overflow menu and then click the `Delete` button', async () => {
    await expect(conditionsPage.page.getByRole('button', { name: /options/i })).toBeVisible();
    await conditionsPage.page.getByRole('button', { name: /options/i }).click();
    await expect(conditionsPage.page.getByRole('menu', { name: /edit or delete condition/i })).toBeVisible();
    await conditionsPage.page.getByRole('menuitem', { name: /delete/i }).click();

    await expect(conditionsPage.page.getByRole('heading', { name: /delete condition/i })).toBeVisible();
    await expect(conditionsPage.page.getByText(/are you sure you want to delete this condition/i)).toBeVisible();
    await expect(conditionsPage.page.getByRole('button', { name: /danger delete/i })).toBeVisible();

    await page.getByRole('button', { name: /danger delete/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(conditionsPage.page.getByText(/condition deleted/i)).toBeVisible();
  });

  await test.step('And I should not see the deleted condition in the list', async () => {
    await expect(conditionsPage.page.getByText(/mental status change/i)).not.toBeVisible();
    await expect(conditionsPage.page.getByText(/There are no conditions to display for this patient/i)).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
