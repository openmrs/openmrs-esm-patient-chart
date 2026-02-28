import { expect } from '@playwright/test';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { generateRandomDrugOrder, deleteDrugOrder, createEncounter, deleteEncounter, getProvider } from '../commands';
import { type Encounter } from '../commands/types';
import { test as base } from '../core';
import { MedicationsPage, OrdersPage } from '../pages';

interface ExistingDrugOrderFixture {
  existingDrugOrder: {
    drugOrder: Order;
    encounter: Encounter;
  };
}

const test = base.extend<ExistingDrugOrderFixture>({
  existingDrugOrder: async ({ api, patient, visit }, use) => {
    const orderer = await getProvider(api);
    const encounter = await createEncounter(api, patient.uuid, orderer.uuid, visit);
    const drugOrder = await generateRandomDrugOrder(api, patient.uuid, encounter, orderer.uuid);

    try {
      await use({ drugOrder, encounter });
    } finally {
      if (drugOrder?.uuid) {
        await deleteDrugOrder(api, drugOrder.uuid);
      }
      if (encounter?.uuid) {
        await deleteEncounter(api, encounter.uuid);
      }
    }
  },
});

test.describe('Drug Order Tests', () => {
  test('Record a drug order', async ({ page, patient }) => {
    const orderBasket = page.locator('[data-extension-slot-name="order-basket-slot"]');
    const medicationsPage = new MedicationsPage(page);

    await test.step('When I visit the medications page', async () => {
      await medicationsPage.goTo(patient.uuid);
    });

    await test.step('And I click the Add button on the medications details table to launch the order basket', async () => {
      const launchOrderBasketButton = page
        .getByRole('button', { name: /record active medications/i })
        .or(page.getByRole('button', { name: 'Add', exact: true }))
        .first();
      await expect(launchOrderBasketButton).toBeVisible();
      await launchOrderBasketButton.click();
    });

    await test.step('And I open the add-drug-order workspace in the order basket', async () => {
      const addDrugOrderSearchbox = page.getByRole('searchbox', { name: /search for a drug or orderset/i });
      const addToOrderBasketButton = page
        .locator("[id='order-basket']")
        .getByRole('button', { name: 'Add', exact: true })
        .first();

      // Some environments open the workspace directly after launching the order basket,
      // while others require an additional "Add +" click.
      await addToOrderBasketButton.click({ timeout: 5_000 }).catch(() => {});
      await expect(addDrugOrderSearchbox).toBeVisible();
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
      const orderBasketLauncher = page.getByRole('button', { name: /^order basket$/i });
      const incompleteAspirinBasketItem = orderBasket
        .getByRole('listitem')
        .filter({ hasText: /aspirin 325mg — 325mg — tablet/i });

      await expect(incompleteAspirinBasketItem)
        .toBeVisible({ timeout: 5_000 })
        .catch(async () => {
          await orderBasketLauncher.click();
          await expect(incompleteAspirinBasketItem).toBeVisible();
        });
      await expect(incompleteAspirinBasketItem.getByRole('status', { name: /incomplete/i })).toBeVisible();
    });

    await test.step('When I click on the incomplete drug order', async () => {
      await orderBasket
        .getByRole('listitem')
        .filter({ hasText: /aspirin 325mg — 325mg — tablet/i })
        .getByRole('status', { name: /incomplete/i })
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
      await page.getByLabel(/^duration$/i).clear();
      await page.getByLabel(/^duration$/i).fill('3');
    });

    await test.step('And I set the quantity to dispense to 3', async () => {
      await page.getByLabel(/^quantity to dispense$/i).clear();
      await page.getByLabel(/^quantity to dispense$/i).fill('3');
    });

    await test.step('And I set the prescription refills to 1', async () => {
      await page.getByLabel(/^prescription refills$/i).clear();
      await page.getByLabel(/^prescription refills$/i).fill('1');
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
      const activeMedicationsTable = page.getByRole('table', { name: /medications/i }).first();
      const headerRow = activeMedicationsTable.locator('thead > tr');
      const dataRow = activeMedicationsTable.locator('tbody > tr').filter({
        hasText: /aspirin 325mg — 325mg — tablet/i,
      });

      await expect(headerRow).toContainText(/start date/i);
      await expect(headerRow).toContainText(/details/i);
      await expect(dataRow).toContainText(/aspirin 325mg — 325mg — tablet/i);
    });
  });

  test('Edit a drug order', async ({ page, patient, existingDrugOrder }) => {
    const medicationsPage = new MedicationsPage(page);
    const drugOrderForm = page.locator('#drugOrderForm');

    await test.step('When I visit the medications page', async () => {
      await medicationsPage.goTo(patient.uuid);
    });
    await test.step('When I click the overflow menu in the table row with the newly created medication', async () => {
      await page
        .getByRole('row')
        .filter({ hasText: existingDrugOrder.drugOrder.drug.display })
        .getByRole('button', { name: /options/i })
        .click();
    });

    await test.step('And I click on the "Modify" button', async () => {
      await page.getByRole('menuitem', { name: /modify/i }).click();
    });

    await test.step('Then I should see the medication order form launch in the workspace in edit mode', async () => {
      await expect(drugOrderForm.getByText('Aspirin 81mg (81mg)')).toBeVisible();
    });

    await test.step('When I change the dose to "2" tablets', async () => {
      await page.getByLabel(/^dose$/i).clear();
      await page.getByLabel(/^dose$/i).fill('2');
    });

    await test.step('And I change the duration to "5" days', async () => {
      await page.getByLabel(/^duration$/i).clear();
      await page.getByLabel(/^duration$/i).fill('5');
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
      await page.getByRole('textbox', { name: /indication/i }).clear();
      await page.getByRole('textbox', { name: /indication/i }).fill('Hypertension');
    });

    await test.step('And I click on the "Save Order" button', async () => {
      await page.getByRole('button', { name: /save order/i }).click();
    });

    await test.step('Then I should see a success notification', async () => {
      await expect(page.getByText(/updated aspirin 81mg/i)).toBeVisible();
    });

    await test.step('And I should see the updated order in the list in Active Medications table', async () => {
      const activeMedicationsTable = page.getByRole('table', { name: /medications/i }).first();
      const headerRow = activeMedicationsTable.locator('thead > tr');
      const dataRow = activeMedicationsTable.locator('tbody > tr');

      await expect(headerRow).toContainText(/start date/i);
      await expect(headerRow).toContainText(/details/i);
      await expect(dataRow).toContainText(/aspirin 81mg/i);
      await expect(dataRow).not.toContainText(/oral/i);
      await expect(dataRow).toContainText(/inhalation/i);
      await expect(dataRow).not.toContainText(/once daily/i);
      await expect(dataRow).toContainText(/twice daily/i);
      await expect(dataRow).not.toContainText(/3 days/i);
      await expect(dataRow).toContainText(/5 days/i);
      await expect(dataRow).not.toContainText(/indication headache/i);
      await expect(dataRow).toContainText(/indication hypertension/i);
    });
  });

  test('Renew a drug order', async ({ page, patient, existingDrugOrder }) => {
    const orderBasket = page.locator('[data-extension-slot-name="order-basket-slot"]');
    const medicationsPage = new MedicationsPage(page);

    await test.step('When I visit the medications page', async () => {
      await medicationsPage.goTo(patient.uuid);
    });

    await test.step('And I open the options menu for the created medication', async () => {
      const row = page.getByRole('row').filter({ hasText: existingDrugOrder.drugOrder.drug.display }).first();
      await row.getByRole('button', { name: /options/i }).click();
    });

    await test.step('And I click on the "Renew" action', async () => {
      await page.getByRole('menuitem', { name: /renew/i }).click();
    });

    await test.step('Then the order basket should show a Renew item for the medication', async () => {
      const basketItem = orderBasket
        .getByRole('listitem')
        .filter({ hasText: existingDrugOrder.drugOrder.drug.display });

      await expect(basketItem).toBeVisible();
      await expect(basketItem.getByRole('status', { name: /renew/i })).toBeVisible();
    });

    await test.step('When I click on the "Sign and close" button', async () => {
      await page.getByRole('button', { name: /sign and close/i }).click();
    });

    await test.step('Then I should see a success notification', async () => {
      await expect(
        page.getByText(/placed order for/i).filter({ hasText: existingDrugOrder.drugOrder.drug.display }),
      ).toBeVisible();
    });

    await test.step('And the renewed medication should appear in the active medications list', async () => {
      const activeMedicationsTable = page.getByRole('table', { name: /medications/i }).first();
      await expect(
        activeMedicationsTable.getByRole('row').filter({ hasText: existingDrugOrder.drugOrder.drug.display }).first(),
      ).toBeVisible();
    });
  });

  test('Discontinue a drug order', async ({ page, patient, existingDrugOrder }) => {
    const orderBasket = page.locator('[data-extension-slot-name="order-basket-slot"]');
    const medicationsPage = new MedicationsPage(page);

    await test.step('When I visit the medications page', async () => {
      await medicationsPage.goTo(patient.uuid);
    });

    await test.step('And I click on the "Discontinue" button', async () => {
      await page
        .getByRole('row')
        .filter({ hasText: existingDrugOrder.drugOrder.drug.display })
        .getByRole('button', { name: /options/i })
        .click();
      await page.getByRole('menuitem', { name: /discontinue/i }).click();
    });

    await test.step('Then the order status should be changed to "Discontinue"', async () => {
      await expect(orderBasket.getByText(/discontinue/i)).toBeVisible();
    });

    await test.step('And I click on the "Sign and close" button', async () => {
      await page.getByRole('button', { name: /sign and close/i }).click();
    });

    await test.step('Then I should see a success notification', async () => {
      await expect(
        page.getByText(/discontinued/i).filter({ hasText: existingDrugOrder.drugOrder.drug.display }),
      ).toBeVisible();
    });

    await test.step('And the medications table should be empty', async () => {
      await expect(page.getByText(/there are no active medications to display for this patient/i)).toBeVisible();
    });
  });

  test('Cancel a existing drug order', async ({ page, patient, existingDrugOrder }) => {
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
      await page
        .getByRole('row')
        .filter({ hasText: existingDrugOrder.drugOrder.drug.display })
        .getByRole('button', { name: /options/i })
        .click();
    });

    await test.step('And I click on the `Cancel order` button', async () => {
      await page.getByRole('menuitem', { name: 'Cancel order' }).click();
    });

    await test.step('And I click on the `Sign and close` button', async () => {
      await page.getByRole('button', { name: 'Sign and close' }).click();
    });

    await test.step('Then I should see a success notification', async () => {
      await expect(
        page.getByText(/discontinued/i).filter({ hasText: existingDrugOrder.drugOrder.drug.display }),
      ).toBeVisible();
    });
  });
});
