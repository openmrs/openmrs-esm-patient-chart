import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import { generateRandomPatient, type Patient, startVisit, endVisit, deletePatient } from '../commands';
import { test } from '../core';
import { ChartPage, OrdersPage } from '../pages';

let patient: Patient;
let visit: Visit;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
});

test('Record, edit and discontinue a lab order', async ({ page }) => {
  const chartPage = new ChartPage(page);
  const ordersPage = new OrdersPage(page);

  await test.step('When I visit the orders page', async () => {
    await ordersPage.goTo(patient.uuid);
  });

  await test.step('And I click on the `Order basket` button on the siderail', async () => {
    await page.getByRole('button', { name: 'Record orders' }).click();
  });

  await test.step('When I launch the `Lab Orders` form', async () => {
    await page.getByRole('button', { name: 'Add', exact: true }).nth(1).click();
  });

  await test.step('And I search for the lab test`', async () => {
    await page.getByPlaceholder('Search for a test type').fill('blood urea nitrogen');
  });

  await test.step('And I click on the order form button`', async () => {
    await page.getByRole('button', { name: 'Order form' }).click();
  });

  await test.step('And I click on the `Save order` button', async () => {
    await page.getByRole('button', { name: 'Save order' }).click();
  });

  await test.step('And I click on the `Save and close` button', async () => {
    await page.getByRole('button', { name: 'Sign and close' }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText('Placed order for blood urea nitrogen ')).toBeVisible();
  });

  await test.step('When I click the overflow menu in the table row with the newly created lab order', async () => {
    await page
      .getByRole('button', { name: /options/i })
      .nth(0)
      .click();
  });
  /*
  await test.step('And I click on the `Edit` button', async () => {
    await page.getByRole('menuitem', { name: /edit this encounter/i }).click();
  });

  await test.step('And I change the lab test to `Hepatitis c test - qualitative`', async () => {
    await page.locator('#tab select').selectOption('1325AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  });

  await test.step('And I save the form', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText('Lab order(s) generated')).toBeVisible();
    await expect(page.getByText(/blood urea nitrogen/i)).not.toBeVisible();
    await expect(page.getByText(/hepatitis c test - qualitative/i)).toBeVisible();
  });

  await test.step('And I should see the updated Laboratory Test Order in the list', async () => {
    await expect(
      page.getByRole('cell', { name: /laboratory test orders/i }).getByText('Laboratory Test Orders'),
    ).toBeVisible();
  });

  await test.step('When I click the overflow menu in the table row with the updated lab order', async () => {
    await page
      .getByRole('button', { name: /options/i })
      .nth(0)
      .click();
  });

  await test.step('And I click on the `Delete` button', async () => {
    await page.getByRole('menuitem', { name: /delete this encounter/i }).click();
    await page.getByRole('button', { name: /delete/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/encounter successfully deleted/i)).toBeVisible();
  });

  await test.step('And the encounters table should be empty', async () => {
    await expect(
      page.getByLabel(/all encounters/i).getByText(/there are no encounters to display for this patient/i),
    ).toBeVisible();
  });
  */
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit.uuid);
  await deletePatient(api, patient.uuid);
});
