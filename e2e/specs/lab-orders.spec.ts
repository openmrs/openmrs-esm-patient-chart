import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { type Encounter, type Provider } from '../commands/types';
import {
  generateRandomPatient,
  type Patient,
  generateRandomTestOrder,
  deleteTestOrder,
  createEncounter,
  deleteEncounter,
  getProvider,
  startVisit,
  endVisit,
  deletePatient,
} from '../commands';
import { test } from '../core';
import { OrdersPage } from '../pages';

let patient: Patient;
let visit: Visit;
const url = process.env.E2E_BASE_URL;
let fullName: String;
let drugOrder: Order;
let encounter: Encounter;
let orderer: Provider;

test.beforeAll(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
  orderer = await getProvider(api);
  encounter = await createEncounter(api, patient.uuid, orderer.uuid, visit);
  drugOrder = await generateRandomTestOrder(api, patient.uuid, encounter, orderer.uuid);
  fullName = patient.person.display || patient.display;
});

test.describe('Running laboratory order tests sequentially', () => {
  test('Modify a lab order', async ({ page }) => {
    await test.step('When I visit the orders page', async () => {
      await page.goto(url + `/spa/patient/${patient.uuid}/chart/Orders`);
    });

    await test.step('Then I should see the previously added lab order in the list', async () => {
      await expect(page.getByRole('cell', { name: /serum glucose/i })).toBeVisible();
    });

    await test.step('When I click the overflow menu in the table row with the existing lab order', async () => {
      await page.getByRole('button', { name: /options/i }).click();
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
      await expect(page.getByRole('status', { name: /modify/i })).toBeVisible();
    });

    await test.step('When I click on the `Sign and close` button', async () => {
      await page.getByRole('button', { name: /sign and close/i }).click();
    });

    await test.step('Then I should see a success notification', async () => {
      await expect(page.getByText(/updated serum glucose/i)).toBeVisible();
    });
  });

  test('Discontinue a lab order', async ({ page }) => {
    await test.step('When I visit the orders page', async () => {
      await page.goto(url + `/spa/patient/${patient.uuid}/chart/Orders`);
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

  test('Record a lab order', async ({ page }) => {
    const orderBasket = page.locator('[data-extension-slot-name="order-basket-slot"]');

    await test.step('When I visit the orders page', async () => {
      await page.goto(url + `/spa/patient/${patient.uuid}/chart/Orders`);
    });

    await test.step('And I click to Add a drug order ', async () => {
      await page.getByRole('button', { name: 'Add' }).click();
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
      await page.goto(url + `/spa/patient/${patient.uuid}/chart/Orders`);
    });

    await test.step('Then I should see the newly added lab order in the list', async () => {
      await expect(page.getByRole('cell', { name: /blood urea nitrogen/i })).toBeVisible();
    });
  });
});

test('Add lab results via lab App', async ({ page }) => {
  await test.step(' Then I  the Laboratory section', async () => {
    await page.goto(url + `/spa/home/laboratory`);
  });

  await test.step('And I select the patient and the order for which the results need to be added', async () => {
    await expect(page.getByRole('tab', { name: 'Tests ordered' })).toBeVisible();

    await page
      .getByRole('row', { name: new RegExp(`Expand current row ${fullName}`) })
      .getByLabel('Expand current row')
      .click();
    await expect(page.getByText(/Status:Order not picked/i)).toBeVisible();
    await expect(page.getByRole('cell', { name: 'serum glucose' })).toBeVisible();
  });

  await test.step(' Then I click on Pick lab request action', async () => {
    await page.getByRole('button', { name: 'Pick Lab Request' }).first().click();
    await page.getByRole('button', { name: 'Pick up lab request' }).click();
    await expect(page.getByText(/You have successfully picked an order/i)).toBeVisible();
  });

  await test.step(' Then I click In progress tab', async () => {
    await page.getByRole('tab', { name: 'In progress' }).click();
  });

  await test.step('And I select the patient and the order for which the results need to be added', async () => {
    await page
      .getByRole('row', { name: new RegExp(`Expand current row ${fullName}`) })
      .getByRole('button', { name: 'Expand current row' })
      .click();
    await expect(page.getByText(/Status:IN_PROGRESS/i)).toBeVisible();
    await expect(page.getByRole('cell', { name: 'serum glucose' })).toBeVisible();
  });

  await test.step(' Then I click Add Lab results form action and enters the result value', async () => {
    await page.getByRole('button', { name: 'Add lab results' }).click();
    await page.getByRole('spinbutton', { name: 'serum glucose (>= 0' }).fill('35');
    await page.getByRole('button', { name: 'Save and close' }).click();
    await expect(page.getByText(/Lab results for .* have been successfully updated/i)).toBeVisible();
  });
});

test.afterAll(async ({ api }) => {
  await endVisit(api, visit);
  await deletePatient(api, patient.uuid);
});
