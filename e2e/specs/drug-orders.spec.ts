import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import {
  generateRandomPatient,
  deletePatient,
  generateRandomDrugOrder,
  deleteDrugOrder,
  createEncounter,
  deleteEncounter,
  getProvider,
  type Patient,
  startVisit,
  endVisit,
} from '../commands';
import { type Encounter, type Provider } from '../types';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { test } from '../core';
import { MedicationsPage, OrdersPage } from '../pages';

let patient: Patient;
let visit: Visit;
let drugOrder: Order;
let encounter: Encounter;
let orderer: Provider;
let url: String;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
  orderer = await getProvider(api);
  encounter = await createEncounter(api, patient.uuid, orderer.uuid);
  drugOrder = await generateRandomDrugOrder(api, patient.uuid, encounter.uuid, orderer.uuid);
});

test('Edit and discontinue a drug order', async ({ page }) => {
  url = process.env.E2E_BASE_URL;
  const form = page.locator('#drugOrderForm');
  const orderBasket = page.locator('[data-extension-slot-name="order-basket-slot"]');

  await test.step('When I visit the medications page', async () => {
    await page.goto(url + `/spa/patient/${patient.uuid}/chart/Medications`);
  });

  await test.step('When I click the overflow menu in the table row with the newly created medication', async () => {
    await page
      .getByRole('button', { name: /options/i })
      .nth(0)
      .click();
  });

  await test.step('And I click on the "Modify" button', async () => {
    await page.getByRole('menuitem', { name: /modify/i }).click();
  });

  await test.step('Then I should see the medication order form launch in the workspace in edit mode', async () => {
    await expect(form.getByText('Aspirin 81mg (81mg)')).toBeVisible();
  });

  await test.step('When I change the dose to "2" tablets', async () => {
    await page.getByLabel(/^dose$/i).clear();
    await page.getByLabel(/^dose$/i).fill('2');
  });

  await test.step('And I change the duration to "5" days', async () => {
    await page.getByText(/^duration$/i).clear();
    await page.getByText(/^duration$/i).fill('5');
  });

  await test.step('And I change the route to "Inhalation"', async () => {
    await page.getByRole('combobox', { name: /route/i }).click();
    await page.getByRole('combobox', { name: /route/i }).clear();
    await page.getByRole('option', { name: /inhalation/i }).click();
  });

  await test.step('And I change the frequency to "Twice daily"', async () => {
    await page.getByRole('combobox', { name: /frequency/i }).click();
    await page.getByRole('combobox', { name: /frequency/i }).clear();
    await page.getByRole('option', { name: /twice daily/i }).click();
  });

  await test.step('And I change the indication to "Hypertension"', async () => {
    await form.getByText(/indication/i).fill('Hypertension');
  });

  await test.step('And I click on the "Save Order" button', async () => {
    await page.getByRole('button', { name: /save order/i }).click();
  });

  await test.step('Then the order status should be changed to "Modify"', async () => {
    await expect(orderBasket.getByText(/new/i)).toBeHidden();
    await expect(orderBasket.getByText(/modify/i)).toBeVisible();
  });

  await test.step('When I click on the "Sign and close" button', async () => {
    await page.getByRole('button', { name: /sign and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/updated aspirin 81mg/i)).toBeVisible();
  });

  await test.step('And I should see the updated order in the list in Active Medications table', async () => {
    const headerRow = page.locator('thead > tr');
    const dataRow = page.locator('tbody > tr');

    await expect(headerRow.nth(0)).toContainText(/start date/i);
    await expect(headerRow.nth(0)).toContainText(/details/i);
    await expect(dataRow.nth(0)).toContainText(/aspirin 81mg/i);
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

  await test.step('And I click on the "Discontinue" button', async () => {
    await page.getByRole('menuitem', { name: /discontinue/i }).click();
  });

  await test.step('Then the order status should be changed to "Discontinue"', async () => {
    await expect(orderBasket.getByText(/discontinue/i)).toBeVisible();
  });

  await test.step('And I click on the "Sign and close" button', async () => {
    await page.getByRole('button', { name: /sign and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/discontinued aspirin 81mg/i)).toBeVisible();
  });

  await test.step('And the medications table should be empty', async () => {
    await expect(page.getByText(/there are no active medications to display for this patient/i)).toBeVisible();
  });
});

test('Cancel a existing drug order', async ({ page, api }) => {
  url = process.env.E2E_BASE_URL;
  await test.step('When I click on the Orders section', async () => {
    await page.goto(url + `/spa/patient/${patient.uuid}/chart/Orders`);
  });

  await test.step('Then I should see an existing drug order in the list', async () => {
    await expect(page.getByRole('cell', { name: 'ORD-' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Drug order' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '(NEW) Aspirin 81mg: 1.0 Milligram Oral Once daily' })).toBeVisible();
  });

  await test.step('When I click the overflow menu in the table row with the existing drug order', async () => {
    await page.getByRole('button', { name: 'Options' }).click();
  });

  await test.step('And I click on the `Cancel order` button', async () => {
    await page.getByRole('menuitem', { name: 'Cancel order' }).click();
  });

  await test.step('And I click on the `Sign and close` button', async () => {
    await page.getByRole('button', { name: 'Sign and close' }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/Discontinued Aspirin 81mg./i)).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit);
  await deleteEncounter(api, encounter.uuid);
  await deleteDrugOrder(api, drugOrder.uuid);
  await deletePatient(api, patient.uuid);
});
