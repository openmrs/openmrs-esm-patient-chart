import { expect } from '@playwright/test';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { generateRandomDrugOrder, deleteDrugOrder, createEncounter, deleteEncounter, getProvider } from '../commands';
import { type Encounter, type Provider } from '../commands/types';
import { test } from '../core';
import { OrdersPage } from '../pages';

let drugOrder: Order;
let encounter: Encounter;
let orderer: Provider;
const url = process.env.E2E_BASE_URL;

test.beforeEach(async ({ api, patient, visit }) => {
  orderer = await getProvider(api);
  encounter = await createEncounter(api, patient.uuid, orderer.uuid, visit);
  drugOrder = await generateRandomDrugOrder(api, patient.uuid, encounter, orderer.uuid);
});

test.describe('Drug Order Tests', () => {
  test('Record a drug order', async ({ page, patient }) => {
    const orderBasket = page.locator('[data-extension-slot-name="order-basket-slot"]');

    await test.step('When I visit the medications page', async () => {
      await page.goto(url + `/spa/patient/${patient.uuid}/chart/Medications`);
    });

    await test.step('And I click the Add button on the medications details table', async () => {
      await page.getByRole('button', { name: 'Add', exact: true }).click();
    });

    await test.step('Then the add drug order workspace should be visible in the order basket', async () => {
      await expect(page.getByText(/add drug order/i)).toBeVisible();
      await expect(page.getByRole('searchbox', { name: /search for a drug or orderset/i })).toBeVisible();
    });

    await test.step('And when I type "Aspirin" in the search box', async () => {
      await page.getByRole('searchbox', { name: /search for a drug or orderset/i }).fill('aspirin');
    });

    await test.step('Then I should see a matching order item for "Aspirin 325mg" in the search results', async () => {
      await expect(page.getByRole('listitem').filter({ hasText: /aspirin 325mg — 325mg — tablet/i })).toBeVisible();
    });

    await test.step('And when I click on the "Add to basket" button for "Aspirin 325mg"', async () => {
      await page
        .getByRole('listitem')
        .filter({ hasText: /aspirin 325mg — 325mg — tablet/i })
        .getByRole('button', { name: /add to basket/i })
        .click();
    });

    await test.step('Then I should see a new incomplete drug order for "Aspirin 325mg"', async () => {
      await expect(page.getByText(/incomplete/i)).toBeVisible();
      await expect(page.getByRole('listitem').filter({ hasText: /aspirin 325mg — 325mg — tablet/i })).toBeVisible();
    });

    await test.step('When I click on the incomplete drug order', async () => {
      await page
        .getByRole('listitem')
        .filter({ hasText: /incomplete/i })
        .click();
    });

    await test.step('Then I should see the medication order form launch in the workspace with the medication details from the order pre-filled', async () => {
      await expect(page.getByText(/order form/i)).toBeVisible();
    });

    await test.step('When I set the dose to "1" tablet', async () => {
      await page.getByLabel(/^dose$/i, { exact: true }).click();
      await page.getByLabel(/^dose$/i, { exact: true }).fill('1');
    });

    await test.step('And I set the route to "Oral"', async () => {
      await page.getByRole('combobox', { name: /route/i }).click();
      await page.getByRole('option', { name: /oral/i }).click();
    });

    await test.step('And I set the frequency to "Once daily"', async () => {
      await page.getByRole('combobox', { name: /frequency/i }).click();
      await page.getByRole('option', { name: /once daily/i }).click();
    });

    await test.step('And I set duration to "3" days', async () => {
      await page.getByText(/^duration$/i).clear();
      await page.getByText(/^duration$/i).fill('3');
    });

    await test.step('And I set the quantity to dispense to 3', async () => {
      await page.getByText(/^quantity to dispense$/i).clear();
      await page.getByText(/^quantity to dispense$/i).fill('3');
    });

    await test.step('And I set the prescription refills to 1', async () => {
      await page.getByText(/^prescription refills$/i).clear();
      await page.getByText(/^prescription refills$/i).fill('1');
    });

    await test.step('And I set the indication to "Headache"', async () => {
      await page.getByRole('textbox', { name: 'Indication' }).fill('Headache');
    });

    await test.step('And I click on the "Save Order" button', async () => {
      await page.getByRole('button', { name: /save order/i }).click();
    });

    await test.step('Then the order status should be changed to "New"', async () => {
      await expect(orderBasket.getByText(/incomplete/i)).toBeHidden();
      await expect(orderBasket.getByText(/new/i)).toBeVisible();
    });

    await test.step('When I click on the "Sign and close" button', async () => {
      await page.getByRole('button', { name: /sign and close/i }).click();
    });

    await test.step('Then I should see a success notification', async () => {
      await expect(page.getByText(/placed order for aspirin/i)).toBeVisible();
    });

    await test.step('And I should see the newly added order in the active medications list', async () => {
      const headerRow = page.locator('thead > tr');
      const dataRow = page.locator('tbody > tr');

      await expect(headerRow).toContainText(/start date/i);
      await expect(headerRow).toContainText(/details/i);
      await page.getByText('Aspirin 325mg — 325mg — tablet').isVisible();
    });
  });

  test('Edit a drug order', async ({ page, patient }) => {
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
      await expect(dataRow.nth(0)).not.toContainText(/oral/i);
      await expect(dataRow.nth(0)).toContainText(/inhalation/i);
      await expect(dataRow.nth(0)).not.toContainText(/once daily/i);
      await expect(dataRow.nth(0)).toContainText(/twice daily/i);
      await expect(dataRow.nth(0)).not.toContainText(/3 days/i);
      await expect(dataRow.nth(0)).toContainText(/5 days/i);
      await expect(dataRow.nth(0)).not.toContainText(/indication headache/i);
      await expect(dataRow.nth(0)).toContainText(/indication hypertension/i);
    });
  });

  test('Discontinue a drug order', async ({ page, patient }) => {
    const orderBasket = page.locator('[data-extension-slot-name="order-basket-slot"]');

    await test.step('When I visit the medications page', async () => {
      await page.goto(url + `/spa/patient/${patient.uuid}/chart/Medications`);
    });

    await test.step('And I click on the "Discontinue" button', async () => {
      await page.getByRole('button', { name: 'Options' }).click();
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

  test('Cancel a existing drug order', async ({ page, patient }) => {
    const ordersPage = new OrdersPage(page);

    await test.step('When I click on the Orders section', async () => {
      await ordersPage.goTo(patient.uuid);
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
});

test.afterEach(async ({ api }) => {
  await deleteEncounter(api, encounter.uuid);
  await deleteDrugOrder(api, drugOrder.uuid);
});
