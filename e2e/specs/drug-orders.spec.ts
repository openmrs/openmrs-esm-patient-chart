import { expect } from '@playwright/test';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { generateRandomDrugOrder, deleteDrugOrder, createEncounter, deleteEncounter, getProvider } from '../commands';
import { type Encounter, type Provider } from '../commands/types';
import { test } from '../core';
import { MedicationsPage, OrdersPage } from '../pages';

let drugOrder: Order;
let encounter: Encounter;
let orderer: Provider;

test.beforeEach(async ({ api, patient, visit }) => {
  orderer = await getProvider(api);
  encounter = await createEncounter(api, patient.uuid, orderer.uuid, visit);
  drugOrder = await generateRandomDrugOrder(api, patient.uuid, encounter, orderer.uuid);
});

test.describe('Drug Order Tests', () => {
  test('Record a drug order', async ({ page, patient }) => {
    const orderBasket = page.locator('[data-extension-slot-name="order-basket-slot"]');
    const medicationsPage = new MedicationsPage(page);

    await test.step('When I visit the medications page', async () => {
      await medicationsPage.goTo(patient.uuid);
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
    const medicationsPage = new MedicationsPage(page);
    const form = page.locator('#drugOrderForm');
    const orderBasket = page.locator('[data-extension-slot-name="order-basket-slot"]');

    await test.step('When I visit the medications page', async () => {
      await medicationsPage.goTo(patient.uuid);
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
    const medicationsPage = new MedicationsPage(page);

    await test.step('When I visit the medications page', async () => {
      await medicationsPage.goTo(patient.uuid);
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

  test('Refill an active medication', async ({ page, patient }) => {
    const medicationsPage = new MedicationsPage(page);
    const form = page.locator('#drugOrderForm');
    const orderBasket = page.locator('[data-extension-slot-name="order-basket-slot"]');

    await test.step('When I visit the medications page', async () => {
      await medicationsPage.goTo(patient.uuid);
    });

    await test.step('Then I should see the existing active medication in the medications table', async () => {
      await expect(page.getByText(/aspirin 81mg/i)).toBeVisible();
      await expect(medicationsPage.medicationsTable()).toBeVisible();
    });

    await test.step('When I click the overflow menu (kebab menu) for the medication', async () => {
      await page
        .getByRole('button', { name: /options/i })
        .first()
        .click();
    });

    await test.step('Then I should see the "Refill" menu option', async () => {
      await expect(page.getByRole('menuitem', { name: /refill/i })).toBeVisible();
    });

    await test.step('When I click on the "Refill" button', async () => {
      await page.getByRole('menuitem', { name: /refill/i }).click();
    });

    await test.step('Then the drug order form workspace should open with pre-populated data', async () => {
      await expect(page.getByText(/order form/i)).toBeVisible();
      await expect(form.getByText(/aspirin 81mg/i)).toBeVisible();
    });

    await test.step('And the form fields should be pre-populated with the original medication data', async () => {
      // Verify dose is pre-filled
      await expect(page.getByLabel(/^dose$/i)).toHaveValue('1');

      // Verify route is pre-filled
      await expect(page.getByRole('combobox', { name: /route/i })).toContainText(/oral/i);

      // Verify frequency is pre-filled
      await expect(page.getByRole('combobox', { name: /frequency/i })).toContainText(/once daily/i);

      // Verify indication is pre-filled
      await expect(page.getByRole('textbox', { name: /indication/i })).toHaveValue(/order reason/i);
    });

    await test.step('And the start date should be set to today', async () => {
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      // Verify start date field contains today's date
      await expect(page.getByLabel(/start date/i)).toBeVisible();
    });

    await test.step('When I modify the duration to "7" days to test editability', async () => {
      await page.getByText(/^duration$/i).clear();
      await page.getByText(/^duration$/i).fill('7');
    });

    await test.step('And I modify the quantity to dispense to "7"', async () => {
      await page.getByText(/^quantity to dispense$/i).clear();
      await page.getByText(/^quantity to dispense$/i).fill('7');
    });

    await test.step('And I modify the indication to "Chronic pain management"', async () => {
      await page.getByRole('textbox', { name: /indication/i }).clear();
      await page.getByRole('textbox', { name: /indication/i }).fill('Chronic pain management');
    });

    await test.step('And I click on the "Save Order" button', async () => {
      await page.getByRole('button', { name: /save order/i }).click();
    });

    await test.step('Then the order status should be changed to "Renew"', async () => {
      await expect(orderBasket.getByText(/renew/i)).toBeVisible();
    });

    await test.step('When I click on the "Sign and close" button', async () => {
      await page.getByRole('button', { name: /sign and close/i }).click();
    });

    await test.step('Then I should see a success notification', async () => {
      await expect(page.getByText(/placed order for aspirin/i)).toBeVisible();
    });

    await test.step('And I should see the newly refilled order in the active medications table', async () => {
      const dataRows = page.locator('tbody > tr');

      // Should have at least 2 rows now (original + refilled)
      await expect(dataRows).toHaveCount(2);

      // Verify the new order has the modified values
      await expect(page.getByText(/7 days/i).first()).toBeVisible();
      await expect(page.getByText(/chronic pain management/i)).toBeVisible();
    });

    await test.step('And the original medication order should remain unchanged in the table', async () => {
      // The original order should still exist (now as second row or marked as historical)
      const allRows = page.locator('tbody > tr');
      await expect(allRows.first()).toContainText(/aspirin 81mg/i);
    });
  });

  test('Refill a past medication', async ({ page, patient }) => {
    const medicationsPage = new MedicationsPage(page);
    const orderBasket = page.locator('[data-extension-slot-name="order-basket-slot"]');

    await test.step('When I visit the medications page', async () => {
      await medicationsPage.goTo(patient.uuid);
    });

    await test.step('When I discontinue the active medication to move it to past medications', async () => {
      await page
        .getByRole('button', { name: /options/i })
        .first()
        .click();
      await page.getByRole('menuitem', { name: /discontinue/i }).click();
      await page.getByRole('button', { name: /sign and close/i }).click();
      await expect(page.getByText(/discontinued aspirin 81mg/i)).toBeVisible();
    });

    await test.step('And I navigate to the Past Medications section', async () => {
      // Wait for the page to update
      await page.waitForTimeout(1000);
      // Scroll to past medications section if needed
      await page.getByText(/past medications/i).scrollIntoViewIfNeeded();
    });

    await test.step('Then I should see the discontinued medication in the past medications table', async () => {
      await expect(
        page
          .locator('tbody')
          .getByText(/discontinued/i)
          .first(),
      ).toBeVisible();
    });

    await test.step('When I click the overflow menu for the past medication', async () => {
      // Find the discontinued medication row's overflow menu
      await page
        .getByRole('button', { name: /options/i })
        .last()
        .click();
    });

    await test.step('Then I should see the "Refill" option for the past medication', async () => {
      await expect(page.getByRole('menuitem', { name: /refill/i })).toBeVisible();
    });

    await test.step('When I click on the "Refill" button', async () => {
      await page.getByRole('menuitem', { name: /refill/i }).click();
    });

    await test.step('Then the drug order form should open with the past medication data pre-populated', async () => {
      await expect(page.getByText(/order form/i)).toBeVisible();
      await expect(page.getByText(/aspirin 81mg/i)).toBeVisible();
    });

    await test.step('When I click on the "Save Order" button', async () => {
      await page.getByRole('button', { name: /save order/i }).click();
    });

    await test.step('And I click on the "Sign and close" button', async () => {
      await page.getByRole('button', { name: /sign and close/i }).click();
    });

    await test.step('Then I should see a success notification', async () => {
      await expect(page.getByText(/placed order for aspirin/i)).toBeVisible();
    });

    await test.step('And the refilled medication should appear in the active medications table', async () => {
      // Navigate back to active medications
      await page
        .getByText(/active medications/i)
        .first()
        .scrollIntoViewIfNeeded();
      await expect(page.getByRole('table', { name: /medications/i }).first()).toContainText(/aspirin 81mg/i);
    });
  });

  test('Cancel refill workflow without saving', async ({ page, patient }) => {
    const medicationsPage = new MedicationsPage(page);
    const orderBasket = page.locator('[data-extension-slot-name="order-basket-slot"]');

    await test.step('When I visit the medications page', async () => {
      await medicationsPage.goTo(patient.uuid);
    });

    await test.step('When I click the overflow menu for a medication', async () => {
      await page
        .getByRole('button', { name: /options/i })
        .first()
        .click();
    });

    await test.step('And I click on the "Refill" button', async () => {
      await page.getByRole('menuitem', { name: /refill/i }).click();
    });

    await test.step('Then the drug order form should open', async () => {
      await expect(page.getByText(/order form/i)).toBeVisible();
    });

    await test.step('When I modify some fields', async () => {
      await page.getByText(/^duration$/i).clear();
      await page.getByText(/^duration$/i).fill('10');
    });

    await test.step('And I close the workspace without saving', async () => {
      await page.getByRole('button', { name: /close/i }).first().click();
    });

    await test.step('Then I should see a discard confirmation modal', async () => {
      await expect(page.getByText(/discard/i)).toBeVisible();
    });

    await test.step('When I confirm discarding the changes', async () => {
      await page.getByRole('button', { name: /discard/i }).click();
    });

    await test.step('Then the order basket should be empty', async () => {
      await expect(orderBasket.getByText(/renew/i)).not.toBeVisible();
    });

    await test.step('And no new medication order should be created', async () => {
      const dataRows = page.locator('tbody > tr');
      // Should have only the original medication
      await expect(dataRows).toHaveCount(1);
    });
  });
});

test.afterEach(async ({ api }) => {
  if (encounter?.uuid) {
    try {
      await deleteEncounter(api, encounter.uuid);
    } catch (error) {
      console.error('Failed to clean up encounter:', error);
    }
  }
  if (drugOrder?.uuid) {
    try {
      await deleteDrugOrder(api, drugOrder.uuid);
    } catch (error) {
      console.error('Failed to clean up drug order:', error);
    }
  }
});
