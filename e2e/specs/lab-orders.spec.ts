import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import { generateRandomPatient, type Patient, startVisit, endVisit, deletePatient } from '../commands';
import { test } from '../core';
import { ChartPage, VisitsPage } from '../pages';

let patient: Patient;
let visit: Visit;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
});

test('Record, edit and discontinue a lab order', async ({ page }) => {
  const chartPage = new ChartPage(page);
  const visitsPage = new VisitsPage(page);

  await test.step('When I visit the chart summary page', async () => {
    await chartPage.goTo(patient.uuid);
  });

  await test.step('And I click on the `Clinical forms` button on the siderail', async () => {
    await chartPage.page.getByLabel(/clinical forms/i).click();
  });

  await test.step('Then I should see the clinical forms workspace', async () => {
    const headerRow = chartPage.formsTable().locator('thead > tr');

    await expect(chartPage.page.getByPlaceholder(/search this list/i)).toBeVisible();
    await expect(headerRow).toContainText(/form name \(a-z\)/i);
    await expect(headerRow).toContainText(/last completed/i);
    await expect(chartPage.page.getByRole('cell', { name: /laboratory test orders/i })).toBeVisible();
  });

  await test.step('When I launch the `Laboratory Test Orders` form', async () => {
    await page.getByText(/laboratory test orders/i).click();
  });

  await test.step('And I click on the `Add` button', async () => {
    await page.getByRole('button', { name: 'Add', exact: true }).click();
  });

  await test.step('And I set the lab test to `Blood urea nitrogen`', async () => {
    await page.locator('#tab select').selectOption('857AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  });

  await test.step('And I click on the `Save and close` button', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText('Lab order(s) generated')).toBeVisible();
    await expect(page.getByText(/blood urea nitrogen/i)).toBeVisible();
  });

  await test.step('When I navigate to the visits dashboard', async () => {
    await visitsPage.goTo(patient.uuid);
  });

  await test.step('And I go to the `All encounters` tab', async () => {
    await page.getByRole('tab', { name: /all encounters/i }).click();
  });

  await test.step('Then I should see the newly added lab order in the list', async () => {
    await expect(
      page.getByRole('cell', { name: /laboratory test orders/i }).getByText('Laboratory Test Orders'),
    ).toBeVisible();
  });

  await test.step('When I click the overflow menu in the table row with the newly created lab order', async () => {
    await page
      .getByRole('button', { name: /options/i })
      .nth(0)
      .click();
  });

  await test.step('And I click on the `Edit` button', async () => {
    await page.getByRole('menuitem', { name: /edit this encounter/i }).click();
  });

  await test.step('And I change the lab test to `Hepatitis c test - qualitative`', async () => {
    await page.locator('#tab select').selectOption('1325AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  });

  await test.step('And I save the form', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success toast notification', async () => {
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

  await test.step('Then I should see a success toast notification', async () => {
    await expect(page.getByText(/encounter successfully deleted/i)).toBeVisible();
  });

  await test.step('And the encounters table should be empty', async () => {
    await expect(
      page.getByLabel(/all encounters/i).getByText(/There are no encounters to display for this patient/i),
    ).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit.uuid);
  await deletePatient(api, patient.uuid);
});
