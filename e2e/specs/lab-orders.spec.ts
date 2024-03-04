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

test('Record, edit and delete a lab order', async ({ page }) => {
  const patientChartPage = new ChartPage(page);
  const visitsPage = new VisitsPage(page);

  await test.step('When I visit the patient chart page', async () => {
    await patientChartPage.goTo(patient.uuid);
  });

  await test.step('And I click on the `Clinical forms` menu', async () => {
    await patientChartPage.page.getByLabel(/clinical forms/i).click();
  });

  await test.step('And I click on the `Laboratory Test Orders` link', async () => {
    await page.getByText(/laboratory test orders/i).click();
  });

  await test.step('And I select a lab test', async () => {
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.locator('#tab select').selectOption('857AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  });

  await test.step('And I click `Save and close` button', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success toast notification', async () => {
    await expect(patientChartPage.page.getByText('Lab order(s) generated')).toBeVisible();
    await expect(patientChartPage.page.getByText(/blood urea nitrogen/i)).toBeVisible();
  });

  await test.step('When I go to the visits page', async () => {
    await visitsPage.goTo(patient.uuid);
  });

  await test.step('And I click `All encounters` tab', async () => {
    await page.getByRole('tab', { name: /all encounters/i }).click();
  });

  await test.step('And I should see the newly added lab order in the list', async () => {
    await expect(
      visitsPage.page.getByRole('cell', { name: /laboratory test orders/i }).getByText('Laboratory Test Orders'),
    ).toBeVisible();
  });

  await test.step('Then if I click on the overflow menu and click the `Options` button', async () => {
    await expect(visitsPage.page.getByRole('button', { name: /options/i })).toBeVisible();
    await page.getByRole('button', { name: /options/i }).click();
  });

  await test.step('And I click `Edit` button', async () => {
    await expect(visitsPage.page.getByText(/edit this encounter/i)).toBeVisible();
    await page.getByRole('menuitem', { name: /edit this encounter/i }).click();
  });

  await test.step('And I edit the lab test', async () => {
    await page.locator('#tab select').selectOption('1325AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  });

  await test.step('And I save the form', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success toast notification', async () => {
    await expect(patientChartPage.page.getByText('Lab order(s) generated')).toBeVisible();
    await expect(patientChartPage.page.getByText(/blood urea nitrogen/i)).not.toBeVisible();
    await expect(patientChartPage.page.getByText(/hepatitis c test - qualitative/i)).toBeVisible();
  });

  await test.step('And I should see the lab order in the list', async () => {
    await expect(
      visitsPage.page.getByRole('cell', { name: /laboratory test orders/i }).getByText('Laboratory Test Orders'),
    ).toBeVisible();
  });

  await test.step('Then if I click on the overflow menu and click the `Options` button', async () => {
    await expect(visitsPage.page.getByRole('button', { name: /options/i })).toBeVisible();
    await page.getByRole('button', { name: /options/i }).click();
  });

  await test.step('And I click `Delete` button', async () => {
    await expect(visitsPage.page.getByText(/delete this encounter/i)).toBeVisible();
    await page.getByRole('menuitem', { name: /delete this encounter/i }).click();
    await page.getByRole('button', { name: /delete/i }).click();
  });

  await test.step('Then I should see a success toast notification', async () => {
    await expect(visitsPage.page.getByText(/encounter successfully deleted/i)).toBeVisible();
  });

  await test.step('And I should not see the deleted test order in the list', async () => {
    await expect(
      visitsPage.page.getByLabel(/all encounters/i).getByText(/There are no encounters to display for this patient/i),
    ).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit.uuid);
  await deletePatient(api, patient.uuid);
});
