import { expect } from '@playwright/test';
import { test } from '../core';
import { ProceduresPage } from '../pages';

test('Record, edit and delete a procedure', async ({ page, patient }) => {
  const proceduresPage = new ProceduresPage(page);

  await test.step('Given I am on the patient procedures page', async () => {
    await proceduresPage.goTo(patient.uuid);
  });

  await test.step('When I click on the `Record procedures` button', async () => {
    await proceduresPage.page.getByText(/record procedures/i).click();
  });

  await test.step('Then I should see the procedures form launch in the workspace', async () => {
    await expect(proceduresPage.page.getByText('Record procedure', { exact: true })).toBeVisible();
  });

  await test.step('When I search for `Orbital surgery` in the search box', async () => {
    await page.getByPlaceholder(/search procedures/i).fill('orbital');
  });

  await test.step('And I select the procedure', async () => {
    await page.getByRole('option', { name: 'Orbital surgery' }).click();
  });

  await test.step('And I select a procedure type', async () => {
    await page.getByRole('combobox', { name: /procedure type/i }).click();
    await page.getByRole('option', { name: /surgical/i }).click();
  });

  await test.step('And I search for `Eye` in the search box for body site', async () => {
    await page.getByPlaceholder(/search body sites/i).fill('eye');
  });

  await test.step('And I select the body site', async () => {
    await page.getByRole('option', { name: 'Eye', exact: true }).click();
  });

  await test.step('And I set the start date and time to 07/07/2024 11:00 AM', async () => {
    const startGroup = page.getByRole('group', { name: /start date and time/i });
    const startDateInput = startGroup.getByLabel(/^date$/i);
    await startDateInput.getByRole('spinbutton', { name: /day/i }).fill('07');
    await startDateInput.getByRole('spinbutton', { name: /month/i }).fill('07');
    await startDateInput.getByRole('spinbutton', { name: /year/i }).fill('2024');
    await startGroup.getByLabel(/^time$/i).fill('11:00');
    await startGroup.getByLabel(/am\/pm/i).selectOption('AM');
  });

  await test.step('And I set the end date and time to 07/07/2024 13:00 PM', async () => {
    const endGroup = page.getByRole('group', { name: /end date and time/i });
    const endDateInput = endGroup.getByLabel(/^date$/i);
    await endDateInput.getByRole('spinbutton', { name: /day/i }).fill('07');
    await endDateInput.getByRole('spinbutton', { name: /month/i }).fill('07');
    await endDateInput.getByRole('spinbutton', { name: /year/i }).fill('2024');
    await endGroup.getByLabel(/^time$/i).fill('01:00');
    await endGroup.getByLabel(/am\/pm/i).selectOption('PM');
  });

  await test.step('And I set the duration to 2 hours', async () => {
    await page.getByLabel('Duration', { exact: true }).fill('2');
    await page.getByRole('combobox', { name: /duration unit/i }).click();
    await page.getByRole('option', { name: /hours/i }).click();
  });

  await test.step('And I set the status to Preparation', async () => {
    await page.getByRole('combobox', { name: /status/i }).click();
    await page.getByRole('option', { name: /preparation/i }).click();
  });

  await test.step('And I enter procedure notes', async () => {
    await page.getByPlaceholder(/enter notes/i).fill('orbital surgery for routine blood pressure check');
  });

  await test.step('And I click the `Save & close` button', async () => {
    await page.getByRole('button', { name: /save & close/i }).click();
  });

  await test.step('Then I should see a "Procedure saved" success notification', async () => {
    await expect(page.getByText(/procedure saved/i)).toBeVisible();
  });

  await test.step('And the procedure orbital surgery should appear in the procedures table', async () => {
    await expect(proceduresPage.proceduresTable().locator('tbody')).toContainText(/orbital surgery/i);
  });

  await test.step('When I click the overflow menu on the orbital surgery procedure row', async () => {
    await proceduresPage
      .proceduresTable()
      .locator('tbody tr')
      .filter({ hasText: /orbital surgery/i })
      .getByRole('button', { name: /options/i })
      .click();
  });

  await test.step('And I click "Edit"', async () => {
    await page.getByRole('menuitem', { name: /edit/i }).click();
  });

  await test.step("Then the procedure workspace should open with the procedure's details pre-filled", async () => {
    await expect(page.getByText(/edit procedure/i)).toBeVisible();
  });

  await test.step('When I update the notes to updated follow-up notes', async () => {
    await page.getByPlaceholder(/enter notes/i).clear();
    await page.getByPlaceholder(/enter notes/i).fill('updated follow-up notes');
  });

  await test.step('And I click "Save & close"', async () => {
    await page.getByRole('button', { name: /save & close/i }).click();
  });

  await test.step('Then I should see a "Procedure updated" success notification', async () => {
    await expect(page.getByText(/procedure updated/i)).toBeVisible();
  });

  await test.step('And the notes for the orbital surgery procedure should show updated follow-up notes', async () => {
    await proceduresPage
      .proceduresTable()
      .locator('tbody tr')
      .filter({ hasText: /orbital surgery/i })
      .getByRole('button', { name: /expand/i })
      .click();
    await expect(page.getByText(/updated follow-up notes/i)).toBeVisible();
  });

  await test.step('When I click the overflow menu on the orbital surgery procedure row', async () => {
    await proceduresPage
      .proceduresTable()
      .locator('tbody tr')
      .filter({ hasText: /orbital surgery/i })
      .getByRole('button', { name: /options/i })
      .click();
  });

  await test.step('And I click "Delete"', async () => {
    await page.getByRole('menuitem', { name: /delete/i }).click();
  });

  await test.step('Then a confirmation modal should appear with the message "Are you sure you want to delete this procedure?"', async () => {
    await expect(page.getByText(/are you sure you want to delete this procedure\?/i)).toBeVisible();
  });

  await test.step('When I click the "Delete" button in the modal', async () => {
    await page.getByRole('button', { name: /danger delete/i }).click();
  });

  await test.step('Then I should see a "Procedure deleted" success notification', async () => {
    await expect(page.getByText(/procedure deleted/i)).toBeVisible();
  });

  await test.step('And the procedure orbital surgery should no longer appear in the procedures table', async () => {
    await expect(
      proceduresPage.proceduresTable().getByRole('cell', { name: 'Orbital surgery', exact: true }),
    ).toBeHidden();
    await expect(page.getByText(/no procedures to display/i)).toBeVisible();
  });

  await test.step('When I click on the `Record procedures` button', async () => {
    await proceduresPage.page.getByText(/record procedures/i).click();
  });

  await test.step('Then I should see the procedures form launch in the workspace', async () => {
    await expect(proceduresPage.page.getByText('Record procedure', { exact: true })).toBeVisible();
  });

  await test.step('When I search for `Orbital surgery` in the search box', async () => {
    await page.getByPlaceholder(/search procedures/i).fill('orbital');
  });

  await test.step('And I select the procedure', async () => {
    await page.getByRole('option', { name: 'Orbital surgery' }).click();
  });

  await test.step('And I select a procedure type', async () => {
    await page.getByRole('combobox', { name: /procedure type/i }).click();
    await page.getByRole('option', { name: /surgical/i }).click();
  });

  await test.step('And I search for `Eye` in the search box for body site', async () => {
    await page.getByPlaceholder(/search body sites/i).fill('eye');
  });

  await test.step('And I select the body site', async () => {
    await page.getByRole('option', { name: 'Eye', exact: true }).click();
  });

  await test.step('And I select "No" for "Is start date known?"', async () => {
    await page.getByRole('tab', { name: /no/i }).click();
  });

  await test.step('And I select year 2025', async () => {
    await page.getByRole('combobox', { name: /year/i }).click();
    await page.getByRole('option', { name: '2025' }).click();
  });

  await test.step('And I select month July', async () => {
    await page.getByRole('combobox', { name: /month/i }).click();
    await page.getByRole('option', { name: 'July' }).click();
  });

  await test.step('And I set the end date and time to 07/07/2025 13:00 PM', async () => {
    const endGroup = page.getByRole('group', { name: /end date and time/i });
    const endDateInput = endGroup.getByLabel(/^date$/i);
    await endDateInput.getByRole('spinbutton', { name: /day/i }).fill('07');
    await endDateInput.getByRole('spinbutton', { name: /month/i }).fill('07');
    await endDateInput.getByRole('spinbutton', { name: /year/i }).fill('2025');
    await endGroup.getByLabel(/^time$/i).fill('01:00');
    await endGroup.getByLabel(/am\/pm/i).selectOption('PM');
  });

  await test.step('And I set the duration to 2 hours', async () => {
    await page.getByLabel('Duration', { exact: true }).fill('2');
    await page.getByRole('combobox', { name: /duration unit/i }).click();
    await page.getByRole('option', { name: /hours/i }).click();
  });

  await test.step('And I set the status to Preparation', async () => {
    await page.getByRole('combobox', { name: /status/i }).click();
    await page.getByRole('option', { name: /preparation/i }).click();
  });

  await test.step('And I enter procedure notes', async () => {
    await page.getByPlaceholder(/enter notes/i).fill('orbital surgery for routine blood pressure check');
  });

  await test.step('And I click "Save & close"', async () => {
    await page.getByRole('button', { name: /save & close/i }).click();
  });

  await test.step('Then I should see a "Procedure saved" success notification', async () => {
    await expect(page.getByText(/procedure saved/i)).toBeVisible();
  });

  await test.step('And the procedure orbital surgery should appear in the procedures table', async () => {
    await expect(proceduresPage.proceduresTable().locator('tbody')).toContainText(/orbital surgery/i);
  });

  await test.step('And the start date column should show Jul — 2025', async () => {
    await expect(proceduresPage.proceduresTable().locator('tbody')).toContainText(/jul.*2025/i);
  });
});
