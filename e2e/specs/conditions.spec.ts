import { test } from '../core';
import { ConditionsPage } from '../pages';
import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, Patient } from '../commands';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('Record, edit and delete a condition', async ({ page, api }) => {
  const conditionsPage = new ConditionsPage(page);
  const row = conditionsPage.conditionsTable().locator('tr');
  const conditionCell = row.locator('td:first-child');
  const dateCell = row.locator('td').nth(1);
  const statusCell = row.locator('td').nth(2);

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
    await expect(conditionCell).toHaveText('Mental status change');
    await expect(dateCell).toHaveText('Jul 2023');
    await expect(statusCell).toHaveText('Active');
  });

  await test.step('Then if I click on the overflow menu and click the `Edit` button', async () => {
    await page.getByLabel(/edit or delete condition/i).click();
    await page.getByRole('menuitem', { name: /edit/i }).click();
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
    await page.getByRole('button', { name: 'Show: Active Open menu' }).click();
    await page.getByText('All').click();
    await expect(conditionCell).toHaveText('Mental status change');
    await expect(dateCell).toHaveText('Jul 2023');
    await expect(statusCell).toHaveText('Inactive');
  });

  await test.step('And if I click the overflow menu and then click the `Delete` button', async () => {
    await page.getByLabel(/edit or delete condition/i).click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'danger Delete' }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(conditionsPage.page.getByText(/condition deleted successfully/i)).toBeVisible();
  });

  await test.step('And I should not see the deleted condition in the list', async () => {
    await expect(conditionsPage.page.getByText(/mental status change/i)).not.toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
