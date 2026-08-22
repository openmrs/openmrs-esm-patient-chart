import { expect } from '@playwright/test';
import { test } from '../core/lab-fixtures';
import { expectLabResultInResultsViewer } from '../commands/test-helpers';
import { OrdersPage } from '../pages';

test.describe('Running laboratory order tests sequentially', () => {
  test('Record a lab order', async ({ page, patient }) => {
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
      await ordersPage.goTo(patient.uuid);
    });

    await test.step('Then I should see the newly added lab order in the list', async () => {
      await expect(page.getByRole('cell', { name: /blood urea nitrogen/i })).toBeVisible();
    });
  });
});

test.describe('Modify and discontinue laboratory order tests sequentially', () => {
  test('Add laboratory results via orders app', async ({ page, patient, existingLabOrder }) => {
    const ordersPage = new OrdersPage(page);
    const conceptName = existingLabOrder.testOrder.concept.display;

    await test.step('When i navigate to the Orders section under patient chart', async () => {
      await ordersPage.goTo(patient.uuid);
    });

    await test.step('Then i should see the existing order from the list ie serum glucose', async () => {
      const row = page
        .getByRole('row')
        .filter({ has: page.getByRole('cell', { name: 'Test order', exact: true }) })
        .filter({ has: page.getByRole('cell', { name: conceptName, exact: true }) });
      await expect(row).toBeVisible();
    });

    await test.step('When I click the overflow menu in the table row', async () => {
      await page
        .getByRole('row')
        .filter({ has: page.getByRole('cell', { name: conceptName, exact: true }) })
        .getByRole('button', { name: /options/i })
        .click();
    });

    await test.step('Then I click on Add results action', async () => {
      await page.getByRole('menuitem', { name: 'Add results' }).click();
      await expect(page.getByRole('spinbutton', { name: conceptName })).toBeVisible();
    });

    await test.step('Then I fill in the lab result and click save', async () => {
      await page.getByRole('spinbutton', { name: conceptName }).fill('55');
      await page.getByRole('button', { name: 'Save and close' }).click();
    });

    await test.step('And a confirmation message should be displayed indicating that the result was saved', async () => {
      await expect(page.getByText(/Lab results for .* have been successfully updated/i)).toBeVisible();
    });

    await test.step('Then I should see the saved lab result in the Results Viewer', async () => {
      await expectLabResultInResultsViewer(page, patient.uuid, conceptName, '55');
    });
  });

  test('Modify a lab order', async ({ page, patient, existingLabOrder }) => {
    const ordersPage = new OrdersPage(page);
    const conceptName = existingLabOrder.testOrder.concept.display;

    await test.step('When I visit the orders page', async () => {
      await ordersPage.goTo(patient.uuid);
    });

    await test.step('Then I should see the previously added lab order in the list', async () => {
      await expect(page.getByRole('cell', { name: conceptName })).toBeVisible();
    });

    await test.step('When I click the overflow menu in the table row with the existing lab order', async () => {
      await page
        .getByRole('row')
        .filter({ hasText: conceptName })
        .getByRole('button', { name: /options/i })
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

    await test.step('Then I should see a success notification', async () => {
      await expect(page.getByText(/updated/i).filter({ hasText: conceptName })).toBeVisible();
    });
  });

  test('Discontinue a lab order', async ({ page, patient, existingLabOrder }) => {
    const ordersPage = new OrdersPage(page);
    const conceptName = existingLabOrder.testOrder.concept.display;

    await test.step('When I visit the orders page', async () => {
      await ordersPage.goTo(patient.uuid);
    });

    await test.step('Then I should see the previously added lab order in the list', async () => {
      await expect(page.getByRole('cell', { name: conceptName })).toBeVisible();
    });

    await test.step('When I click the overflow menu in the table row with the existing lab order', async () => {
      await page
        .getByRole('row')
        .filter({ hasText: conceptName })
        .getByRole('button', { name: /options/i })
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
      await expect(page.getByText(/discontinued/i).filter({ hasText: conceptName })).toBeVisible();
    });

    await test.step('And the discontinued order should no longer appear in the table', async () => {
      await expect(page.getByRole('cell', { name: conceptName })).toBeHidden();
    });
  });
});
