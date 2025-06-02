import { expect } from '@playwright/test';
import { generateRandomTestOrder, deleteTestOrder, createEncounter, deleteEncounter, getProvider } from '../commands';
import { test } from '../core';
import { type Encounter, type Provider } from '../commands/types';
import { type Order } from '@openmrs/esm-patient-common-lib';

let testOrder: Order;
let encounter: Encounter;
let orderer: Provider;

test.describe('Running laboratory order tests sequentially', () => {
  test('Record a lab order', async ({ page, patient }) => {
    await page.goto(process.env.E2E_BASE_URL + `/spa/patient/${patient.uuid}/chart/Orders`);
    const orderBasket = page.locator('[data-extension-slot-name="order-basket-slot"]');

    await test.step('When I visit the orders page', async () => {
      await page.goto(patient.uuid);
    });

    await test.step('And I click on the `Record orders` link', async () => {
      await page.getByText(/record orders/i).click();
    });

    await test.step('And I click the `Add +` button on the Lab orders tile', async () => {
      await orderBasket.getByRole('button', { name: /add/i }).nth(1).click();
    });

    await test.step('Then I type `Blood urea nitrogen` into the search bar', async () => {
      await page.getByRole('searchbox', { name: /search for a test type/i }).fill('blood urea nitrogen');
    });

    await test.step('And I click the `Add to basket` button on the `Blood urea nitrogen` entry in the list', async () => {
      await page
        .getByRole('listitem')
        .filter({ hasText: /blood urea nitrogen/i })
        .getByRole('button', { name: /order form/i })
        .click();
    });

    await test.step('Then I should see the lab order form launch in the workspace', async () => {
      await expect(page.getByText(/add test order/i)).toBeVisible();
    });

    await test.step('When I fill in the fields in the form for the Blood urea nitrogen test and submit the form', async () => {
      await page.getByLabel(/reference number/i).fill(' 20240419-1234');
      await page.getByLabel(/additional instructions/i).fill(' N/A');
    });

    await test.step('And I save the lab order form', async () => {
      await page.getByRole('button', { name: /save order/i }).click();
    });

    await test.step('And I click the `Sign and close` button', async () => {
      await expect(page.getByRole('status', { name: /new/i })).toBeVisible();
      await page.getByRole('button', { name: /sign and close/i }).click();
    });

    await test.step('Then I should see a success notification', async () => {
      await expect(page.getByText(/placed order for blood urea nitrogen/i)).toBeVisible();
    });

    await test.step('When I navigate to the orders dashboard', async () => {
      await page.goto(patient.uuid);
    });

    await test.step('Then I should see the newly added lab order in the list', async () => {
      await expect(page.getByRole('cell', { name: /blood urea nitrogen/i })).toBeVisible();
    });
  });
});

test.describe('Modify and discontinue laboratory order tests sequentially', () => {
  test.beforeEach(async ({ api, patient, visit }) => {
    orderer = await getProvider(api);
    encounter = await createEncounter(api, patient.uuid, orderer.uuid, visit);
    testOrder = await generateRandomTestOrder(api, patient.uuid, encounter, orderer.uuid);
  });

  test('Add laboratory results via orders app', async ({ page, patient }) => {
    await test.step('When i navigate to the Orders section under patient chart', async () => {
      await page.goto(process.env.E2E_BASE_URL + `/spa/patient/${patient.uuid}/chart/Orders`);
    });

    await test.step('Then i should see the existing order from the list ie serum glucose', async () => {
      const row = page
        .locator('tr')
        .filter({ has: page.getByRole('cell', { name: 'Test order', exact: true }) })
        .filter({ has: page.getByRole('cell', { name: 'Serum glucose', exact: true }) });
      await expect(row).toBeVisible();
    });

    await test.step('When I click the overflow menu in the table row', async () => {
      await page
        .getByRole('button', { name: /options/i })
        .nth(0)
        .click();
    });

    await test.step('Then I click on Add results action', async () => {
      await page.getByRole('menuitem', { name: 'Add results' }).click();
      await expect(page.getByRole('spinbutton', { name: 'Serum glucose (>= 0 mg/dl)' })).toBeVisible();
    });

    await test.step('Then I fill in the lab result and click save', async () => {
      await page.getByRole('spinbutton', { name: 'Serum glucose (>= 0 mg/dl)' }).fill('55');
      await page.getByRole('button', { name: 'Save and close' }).click();
    });

    await test.step('And a confirmation message should be displayed indicating that the result was saved', async () => {
      await expect(page.getByText(/Lab results for .* have been successfully updated/i)).toBeVisible();
    });
  });

  test('Modify a lab order', async ({ page, patient }) => {
    await test.step('When I visit the orders page', async () => {
      await page.goto(process.env.E2E_BASE_URL + `/spa/patient/${patient.uuid}/chart/Orders`);
    });

    await test.step('Then I should see the previously added lab order in the list', async () => {
      await expect(page.getByRole('cell', { name: /serum glucose/i })).toBeVisible();
    });

    await test.step('When I click the overflow menu in the table row with the existing lab order', async () => {
      await page
        .getByRole('button', { name: /options/i })
        .nth(0)
        .click();
    });

    await test.step('And I click on the `Modify order` button', async () => {
      await page.getByRole('menuitem', { name: /modify order/i }).click();
    });

    await test.step('And I change the additional instructions to `Priority test order`', async () => {
      await page.getByLabel(/additional instructions/i).clear();
      await page.getByLabel(/additional instructions/i).fill('Priority test order');
    });

    await test.step('And I click on the `Save Order` button', async () => {
      await page.getByRole('button', { name: /save order/i }).click();
    });

    await test.step('Then the order status should be changed to `Modify`', async () => {
      await expect(page.getByRole('status', { name: /new/i })).toBeHidden();
      await expect(page.getByRole('status', { name: /modify/i }).nth(0)).toBeVisible();
    });

    await test.step('When I click on the `Sign and close` button', async () => {
      await page.getByRole('button', { name: /sign and close/i }).click();
    });

    await test.step('Then I should see a success notification', async () => {
      await expect(page.getByText(/updated serum glucose/i)).toBeVisible();
    });
  });

  test('Discontinue a lab order', async ({ page, patient }) => {
    await test.step('When I visit the orders page', async () => {
      await page.goto(process.env.E2E_BASE_URL + `/spa/patient/${patient.uuid}/chart/Orders`);
    });

    await test.step('Then I should see the previously added lab order in the list', async () => {
      await expect(page.getByRole('cell', { name: /serum glucose/i })).toBeVisible();
    });

    await test.step('When I click the overflow menu in the table row with the existing lab order', async () => {
      await page
        .getByRole('button', { name: /options/i })
        .nth(0)
        .click();
    });

    await test.step('And I click on the `Cancel order` button', async () => {
      await page.getByRole('menuitem', { name: /cancel order/i }).click();
    });

    await test.step('Then the order status should be changed to `Discontinue`', async () => {
      await expect(page.getByRole('status', { name: /discontinue/i })).toBeVisible();
    });

    await test.step('And I click on the `Sign and close` button', async () => {
      await page.getByRole('button', { name: /sign and close/i }).click();
    });

    await test.step('Then I should see a success notification', async () => {
      await expect(page.getByText(/discontinued serum glucose/i)).toBeVisible();
    });

    await test.step('And the order table should be empty', async () => {
      await expect(page.getByText(/there are no orders to display for this patient/i)).toBeVisible();
    });
  });
});

test.afterEach(async ({ api }) => {
  if (encounter) {
    await deleteEncounter(api, encounter.uuid);
    encounter = undefined;
  }
  if (testOrder) {
    await deleteTestOrder(api, testOrder.uuid);
    testOrder = undefined;
  }
});
