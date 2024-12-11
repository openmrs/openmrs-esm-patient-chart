import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import { generateRandomPatient, deletePatient, type Patient, startVisit, endVisit } from '../commands';
import { test } from '../core';
import { MedicationsPage } from '../pages';

let patient: Patient;
let visit: Visit;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
});

test('Record, edit and discontinue a drug order', async ({ page }) => {
  const medicationsPage = new MedicationsPage(page);
  const form = page.locator('#drugOrderForm');
  const orderBasket = page.locator('[data-extension-slot-name="order-basket-slot"]');

  await test.step('When I visit the medications page', async () => {
    await medicationsPage.goTo(patient.uuid);
  });

  await test.step('And I click on the `Record active medications` link', async () => {
    await page.getByText(/record active medications/i).click();
  });

  await test.step('And I search for `Aspirin` in the search bar', async () => {
    await page.getByRole('searchbox', { name: /search for a drug or orderset/i }).fill('aspirin');
  });

  await test.step('And I add `Aspirin 81mg` to the basket', async () => {
    await page
      .getByRole('listitem')
      .filter({ hasText: /aspirin 81mg — 81mg — tablet/i })
      .getByRole('button', { name: /add to basket/i })
      .click();
  });

  await test.step('Then I should see `Aspirin 81mg` under drug order', async () => {
    await expect(page.getByText('Aspirin 81mg')).toBeVisible();
  });

  await test.step('When I click on the created drug order', async () => {
    await page
      .getByRole('listitem')
      .filter({ hasText: /incomplete/i })
      .click();
  });

  await test.step('Then I should see the drug order form launch in the workspace', async () => {
    await expect(page.getByText(/order form/i)).toBeVisible();
  });

  await test.step('When I set the dose to `1` tablet', async () => {
    await form.getByLabel(/^dose$/i).clear();
    await form.getByLabel(/^dose$/i).fill('1');
  });

  await test.step('And I set the route to `Oral`', async () => {
    await form.getByPlaceholder(/route/i).click();
    await form.getByText('Oral', { exact: true }).click();
  });

  await test.step('And I set the frequency to `Once daily`', async () => {
    await form.getByPlaceholder(/frequency/i).click();
    await form.getByText('Once daily', { exact: true }).click();
  });

  await test.step('And I set duration to `3` days', async () => {
    await form.getByLabel(/^duration$/i).clear();
    await form.getByLabel(/^duration$/i).fill('3');
  });

  await test.step('And I set the quantity to dispense to 3', async () => {
    await form.getByLabel(/^quantity to dispense$/i).clear();
    await form.getByLabel(/^quantity to dispense$/i).fill('3');
  });

  await test.step('And I set the prescription refills to 1', async () => {
    await form.getByLabel(/^prescription refills$/i).clear();
    await form.getByLabel(/^prescription refills$/i).fill('1');
  });

  await test.step('And I set the indication to `Headache`', async () => {
    await form.getByLabel(/indication/i).clear();
    await form.getByLabel(/indication/i).fill('Headache');
  });

  await test.step('And I click on the "Save Order" button', async () => {
    await form.getByRole('button', { name: /save order/i }).click();
  });

  await test.step('Then the order status should be changed to `New`', async () => {
    await expect(orderBasket.getByText(/incomplete/i)).not.toBeVisible();
    await expect(orderBasket.getByText(/new/i)).toBeVisible();
  });

  await test.step('When I click on the `Sign and close` button', async () => {
    await page.getByRole('button', { name: /sign and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/placed order for aspirin/i)).toBeVisible();
  });

  await test.step('And I should see the newly added order in the active medications list', async () => {
    const headerRow = medicationsPage.medicationsTable().locator('thead > tr');
    const dataRow = medicationsPage.medicationsTable().locator('tbody > tr');

    await expect(headerRow).toContainText(/start date/i);
    await expect(headerRow).toContainText(/details/i);
    await expect(dataRow).toContainText(/aspirin 81mg/i);
    await expect(dataRow).toContainText(/1 tablet/i);
    await expect(dataRow).toContainText(/oral/i);
    await expect(dataRow).toContainText(/once daily/i);
    await expect(dataRow).toContainText(/3 days/i);
    await expect(dataRow).toContainText(/indication headache/i);
  });

  await test.step('When I click the overflow menu in the table row with the newly created medication', async () => {
    await page
      .getByRole('button', { name: /options/i })
      .nth(0)
      .click();
  });

  await test.step('And I click on the `Modify` button', async () => {
    await page.getByRole('menuitem', { name: /modify/i }).click();
  });

  await test.step('Then I should see the medication launch in the workspace in edit mode', async () => {
    await expect(form.getByText('Aspirin 81mg (81mg)')).toBeVisible();
  });

  await test.step('When I change the dose to `2` tablets', async () => {
    await form.getByLabel(/^dose$/i).clear();
    await form.getByLabel(/^dose$/i).fill('2');
  });

  await test.step('And I change the duration to `5` days', async () => {
    await form.getByLabel(/^duration$/i).clear();
    await form.getByLabel(/^duration$/i).fill('5');
  });

  await test.step('And I change the route to `Inhalation`', async () => {
    await form.getByPlaceholder(/route/i).click();
    await form.getByPlaceholder(/route/i).clear();
    await form.getByPlaceholder(/route/i).fill('Inhalation');
    await form.getByText('Inhalation', { exact: true }).click();
  });

  await test.step('And I change the frequency to `Twice daily`', async () => {
    await form.getByPlaceholder(/frequency/i).clear();
    await form.getByText('Twice daily', { exact: true }).click();
  });

  await test.step('And I set the frequency to `q12`', async () => {
    await form.getByPlaceholder(/frequency/i).clear();
    await form.getByPlaceholder(/frequency/i).fill('q12');
    await form.getByText('Every twelve hours', { exact: true }).click();
  });

  await test.step('And I set the frequency to `od`', async () => {
    await form.getByPlaceholder(/frequency/i).clear();
    await form.getByPlaceholder(/frequency/i).fill('od');
    await form.getByText('Once daily', { exact: true }).click();
  });

  await test.step('And I set the frequency to `bd`', async () => {
    await form.getByPlaceholder(/frequency/i).clear();
    await form.getByPlaceholder(/frequency/i).fill('bd');
    await form.getByText('Twice daily', { exact: true }).click();
  });

  await test.step('And I change the indication to `Hypertension`', async () => {
    await form.getByLabel(/indication/i).clear();
    await form.getByLabel(/indication/i).fill('Hypertension');
  });

  await test.step('And I click on the `Save Order` button', async () => {
    await form.getByRole('button', { name: /save order/i }).click();
  });

  await test.step('Then the order status should be changed to `Modify`', async () => {
    await expect(orderBasket.getByText(/new/i)).not.toBeVisible();
    await expect(orderBasket.getByText(/modify/i)).toBeVisible();
  });

  await test.step('When I click on the `Sign and close` button', async () => {
    await page.getByRole('button', { name: /sign and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/updated aspirin 81mg/i)).toBeVisible();
  });

  await test.step('And I should see the updated order in the list in Active Medications table', async () => {
    const headerRow = medicationsPage.medicationsTable().locator('thead > tr');
    const dataRow = medicationsPage.medicationsTable().locator('tbody > tr');

    await expect(headerRow.nth(0)).toContainText(/start date/i);
    await expect(headerRow.nth(0)).toContainText(/details/i);
    await expect(dataRow.nth(0)).toContainText(/aspirin 81mg/i);
    await expect(dataRow.nth(0)).not.toContainText(/1 tablet/i);
    await expect(dataRow.nth(0)).toContainText(/2 tablet/i);
    await expect(dataRow.nth(0)).not.toContainText(/oral/i);
    await expect(dataRow.nth(0)).toContainText(/inhalation/i);
    await expect(dataRow.nth(0)).not.toContainText(/once daily/i);
    await expect(dataRow.nth(0)).toContainText(/twice daily/i);
    await expect(dataRow.nth(0)).not.toContainText(/3 days/i);
    await expect(dataRow.nth(0)).toContainText(/5 days/i);
    await expect(dataRow.nth(0)).not.toContainText(/indication headache/i);
    await expect(dataRow.nth(0)).toContainText(/indication hypertension/i);
  });

  await test.step('When I click the overflow menu in the table row with the updated medication', async () => {
    await page
      .getByRole('button', { name: /options/i })
      .nth(0)
      .click();
  });

  await test.step('And I click on the `Discontinue` button', async () => {
    await page.getByRole('menuitem', { name: /discontinue/i }).click();
  });

  await test.step('Then the order status should be changed to `Discontinue`', async () => {
    await expect(orderBasket.getByText(/discontinue/i)).toBeVisible();
  });

  await test.step('And I click on the `Sign and close` button', async () => {
    await page.getByRole('button', { name: /sign and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/discontinued aspirin 81mg/i)).toBeVisible();
  });

  await test.step('And the medications table should be empty', async () => {
    await expect(page.getByText(/there are no active medications to display for this patient/i)).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit);
  await deletePatient(api, patient.uuid);
});
