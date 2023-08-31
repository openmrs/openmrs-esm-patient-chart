import { test } from '../core';
import { ConditionsPage } from '../pages';
import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, Patient } from '../commands';

let patient: Patient;

test.beforeEach(async ({ api }) => {
    patient = await generateRandomPatient(api);
});

test('Should add, delete and edit a condition', async ({page, api}) => {
    const conditionsPage = new ConditionsPage(page);
    const row = conditionsPage.conditionsTable().locator('tr');
    const conditionCell = row.locator('td:first-child');
    const dateCell = row.locator('td').nth(1);
    const statusCell = row.locator('td').nth(2);

    await test.step('When I goto the conditions page', async () => {
        await conditionsPage.goto(patient.uuid);
    });

    await test.step('And I click on the record conditions button', async () => {
        await conditionsPage.page.getByText('Record conditions').click();
    });

    await test.step('And I filled the form', async () => {
        await page.getByPlaceholder('Search conditions').fill('mental');
        await page.getByRole('menuitem', { name: 'Mental status change' }).click();
        await page.getByLabel('Onset date').fill('10/07/2023');
        await page.getByLabel('Onset date').press('Tab');
    });

    await test.step('And I save the form', async () =>{
        await page.getByRole('button', { name: 'Save & close' }).click();
    });

    await test.step('Then I should see the notification', async () => {
        await expect(conditionsPage.page.getByText('saved')).toBeVisible();
    });

    await test.step('And I see the condition in the list', async () => {
        await expect(conditionCell).toHaveText('Mental status change');
        await expect(dateCell).toHaveText('Jul 2023');
        await expect(statusCell).toHaveText('Active');
    });

    await test.step('And I click on the edit condition button', async () => {
        await page.getByRole('button', { name: 'Edit or delete condition' }).click();
        await page.getByRole('menuitem', { name: 'Edit' }).click();
    });

    await test.step('And I edit the condition', async () => {
        await page.locator('label').filter({ hasText: 'Inactive' }).click();
        await page.getByLabel('End date').fill('11/07/2023');
        await page.getByLabel('End date').press('Tab');
    });
    
    await test.step('And I save the form', async () =>{
        await page.getByRole('button', { name: 'Save & close' }).click();
    });

    await test.step('Then I should see the notification', async () => {
        await expect(conditionsPage.page.getByText('Condition updated')).toBeVisible();
    });

    await test.step('And I see the condition in the list', async () => {
        await page.getByRole('button', { name: 'Show: Active Open menu' }).click();
        await page.getByText('All').click();
        await expect(conditionCell).toHaveText('Mental status change');
        await expect(dateCell).toHaveText('Jul 2023');
        await expect(statusCell).toHaveText('Inactive');
    });

    await test.step('And I click on the delete condition button', async () => {
        await page.getByRole('button', { name: 'Edit or delete condition' }).click();
        await page.getByRole('menuitem', { name: 'Delete' }).click();
        await page.getByRole('button', { name: 'danger Delete' }).click();
    });

    await test.step('Then I should see the notification', async () => {
        await expect(conditionsPage.page.getByText('Condition deleted successfully')).toBeVisible();
    });
})

test.afterEach(async ({ api }) => {
    await deletePatient(api, patient.uuid);
});
