import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import { generateRandomPatient, type Patient, startVisit, endVisit, deletePatient } from '../commands';
import { test } from '../core';
import { OrdersPage } from '../pages';

let patient: Patient;
let visit: Visit;

test.beforeAll(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
});

test.describe.serial('Running laboratory order tests sequentially', () => {
  test('Record a lab order', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    const orderBasket = page.locator('[data-extension-slot-name="order-basket-slot"]');

    await test.step('When I visit the orders page', async () => {
      await ordersPage.goTo(patient.uuid);
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
      await expect(page.getByText(/add lab order/i)).toBeVisible();
    });

    await test.step('When I fill in the fields in the form for the Blood urea nitrogen test and submit the form', async () => {
      await page.getByLabel(/lab reference number/i).fill(' 20240419-1234');
      await page.getByLabel(/additional instructions/i).fill(' N/A');
    });

    await test.step('Add I save the lab order form', async () => {
      await page.getByRole('button', { name: /save order/i }).click();
      await page.getByRole('button', { name: /sign and close/i }).click();
    });

    await test.step('Then I should see a success notification', async () => {
      await expect(page.getByText(/placed order for blood urea nitrogen/i)).toBeVisible();
    });

    await test.step('When I navigate to the orders dashboard', async () => {
      await ordersPage.goTo(patient.uuid);
    });

    await test.step('Then I should see the newly added lab order in the list', async () => {
      await expect(page.getByRole('cell', { name: /blood urea nitrogen/i })).toBeVisible();
    });
  });

  test('Modify a lab order', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    const orderBasket = page.locator('[data-extension-slot-name="order-basket-slot"]');

    await test.step('When I visit the orders page', async () => {
      await ordersPage.goTo(patient.uuid);
    });

    await test.step('Then I should see the previously added lab order in the list', async () => {
      await expect(page.getByRole('cell', { name: /blood urea nitrogen/i })).toBeVisible();
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
      await expect(orderBasket.getByText(/new/i)).not.toBeVisible();
      await expect(orderBasket.getByText(/modify/i)).toBeVisible();
    });

    await test.step('When I click on the `Sign and close` button', async () => {
      await page.getByRole('button', { name: /sign and close/i }).click();
    });

    await test.step('Then I should see a success notification', async () => {
      await expect(page.getByText(/updated blood urea nitrogen/i)).toBeVisible();
    });
  });

  test('Discontinue a lab order', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    const orderBasket = page.locator('[data-extension-slot-name="order-basket-slot"]');

    await test.step('When I visit the orders page', async () => {
      await ordersPage.goTo(patient.uuid);
    });

    await test.step('Then I should see the previously added lab order in the list', async () => {
      await expect(page.getByRole('cell', { name: /blood urea nitrogen/i })).toBeVisible();
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
      await expect(orderBasket.getByText(/discontinue/i)).toBeVisible();
    });

    await test.step('And I click on the `Sign and close` button', async () => {
      await page.getByRole('button', { name: /sign and close/i }).click();
    });

    await test.step('Then I should see a success notification', async () => {
      await expect(page.getByText(/discontinued blood urea nitrogen/i)).toBeVisible();
    });

    await test.step('And the order table should be empty', async () => {
      await expect(page.getByText(/there are no orders to display for this patient/i)).toBeVisible();
    });
  });
});

test.afterAll(async ({ api }) => {
  await endVisit(api, visit.uuid);
  await deletePatient(api, patient.uuid);
});
