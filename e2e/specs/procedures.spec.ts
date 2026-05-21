import { expect } from '@playwright/test';
import { test } from '../core';
import { ProceduresPage } from '../pages';

test('Record a procedure with a known start date', async ({ page, patient }) => {
  const proceduresPage = new ProceduresPage(page);

  await test.step('Given I am on the patient procedures page', async () => {
    await proceduresPage.goTo(patient.uuid);
  });

  await test.step('When I click on the `Record procedures` button', async () => {
    await proceduresPage.page.getByText(/record procedures/i).click();
  });

  await test.step('Then I should see the procedures from launch in the workspace', async () => {
    await expect(proceduresPage.page.getByText('Record procedure', { exact: true })).toBeVisible();
  });

  await test.step('When I search for `Orbital surgery` in the search box', async () => {
    await page.getByPlaceholder(/search procedures/i).fill('orbital');
  });

  await test.step('And I select the procedure', async () => {
    await page.getByRole('menuitem', { name: 'Orbital surgery' }).click();
  });

  // Todo: add another step in here to fill the procedure type.

  await test.step('And I search for `Eye` in the search box for body site', async () => {
    await page.getByPlaceholder(/search body sites/i).fill('eye');
  });

  await test.step('And I select the body site', async () => {
    await page.getByRole('menuitem', { name: 'Eye', exact: true }).click();
  });

  await test.step('And I set the start date and time to 07/07/2027 11:00 AM', async () => {
    const startGroup = page.getByRole('group', { name: /start date and time/i });
    const startDateInput = startGroup.getByLabel(/^date$/i);
    await startDateInput.getByRole('spinbutton', { name: /day/i }).fill('07');
    await startDateInput.getByRole('spinbutton', { name: /month/i }).fill('07');
    await startDateInput.getByRole('spinbutton', { name: /year/i }).fill('2027');
    await startGroup.getByLabel(/^time$/i).fill('11:00');
    await startGroup.getByLabel(/am\/pm/i).selectOption('AM');
  });

  await test.step('And I set the end date and time to 07/07/2027 13:00 PM', async () => {
    const endGroup = page.getByRole('group', { name: /end date and time/i });
    const endDateInput = endGroup.getByLabel(/^date$/i);
    await endDateInput.getByRole('spinbutton', { name: /day/i }).fill('07');
    await endDateInput.getByRole('spinbutton', { name: /month/i }).fill('07');
    await endDateInput.getByRole('spinbutton', { name: /year/i }).fill('2027');
    await endGroup.getByLabel(/^time$/i).fill('13:00');
    await endGroup.getByLabel(/am\/pm/i).selectOption('PM');
  });

  await test.step('And I set the duration to 2 hours', async () => {
    await page.getByLabel('Duration', { exact: true }).fill('2');
    await page.getByRole('combobox', { name: /duration unit/i }).click();
    await page.getByRole('option', { name: /hours/i }).click();
  });

  await test.step('And I set the status to Preparation', async () => {
    await page.locator('#status').click();
    await page.getByRole('option', { name: /preparation/i }).click();
  });

  await test.step('And I enter notes routine blood pressure check', async () => {
    await page.getByPlaceholder(/enter notes/i).fill('orbital surgery for routine blood pressure check');
  });

  await test.step('And I click the `Save & close` button', async () => {
    await page.getByRole('button', { name: /save & close/i }).click();
  });

  await test.step('Then I should see a "Procedure saved" success notification', async () => {
    await expect(page.getByText(/procedure saved/i)).toBeVisible();
  });

  await test.step('And the procedure orbital surgery panel should appear in the procedures table', async () => {
    await expect(proceduresPage.proceduresTable().locator('tbody')).toContainText(/orbital surgery panel/i);
  });
});

test('Record a procedure with an unknown start date', async ({ page, patient }) => {
  const proceduresPage = new ProceduresPage(page);

  await test.step('Given I am on the patient procedures page', async () => {
    await proceduresPage.goTo(patient.uuid);
  });

  await test.step('When I click on the `Record procedures` button', async () => {
    await proceduresPage.page.getByText(/record procedures/i).click();
  });

  await test.step('Then I should see the procedures from launch in the workspace', async () => {
    await expect(proceduresPage.page.getByText('Record procedure', { exact: true })).toBeVisible();
  });

  await test.step('When I search for `Orbital surgery` in the search box', async () => {
    await page.getByPlaceholder(/search procedures/i).fill('orbital');
  });

  await test.step('And I select the procedure', async () => {
    await page.getByRole('menuitem', { name: 'Orbital surgery' }).click();
  });

  // Todo: add another step in here to fill the procedure type.

  await test.step('And I search for `Eye` in the search box for body site', async () => {
    await page.getByPlaceholder(/search body sites/i).fill('eye');
  });

  await test.step('And I select the body site', async () => {
    await page.getByRole('menuitem', { name: 'Eye', exact: true }).click();
  });

  await test.step('And I select "No" for "Is start date known?"', async () => {
    await page.getByRole('tab', { name: /no/i }).click();
  });

  await test.step('And I select year 2027', async () => {
    await page.getByRole('combobox', { name: /year/i }).click();
    await page.getByRole('option', { name: '2027' }).click();
  });

  await test.step('And I select month July', async () => {
    await page.getByRole('combobox', { name: /month/i }).click();
    await page.getByRole('option', { name: 'July' }).click();
  });

  await test.step('And I click "Save & close"', async () => {
    await page.getByRole('button', { name: /save & close/i }).click();
  });

  await test.step('Then I should see a "Procedure saved" success notification', async () => {
    await expect(page.getByText(/procedure saved/i)).toBeVisible();
  });

  await test.step('And the procedure orbital surgery panel should appear in the procedures table', async () => {
    await expect(proceduresPage.proceduresTable().locator('tbody')).toContainText(/orbital surgery panel/i);
  });

  await test.step('And the start date column should show July 2027*', async () => {
    await expect(proceduresPage.proceduresTable().locator('tbody')).toContainText(/july 2027\*/i);
  });
});
