import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import { generateRandomPatient, deletePatient, type Patient, startVisit, endVisit } from '../commands';
import { test } from '../core';
import { MedicationsPage } from '../pages';

let patient: Patient;
let visit: Visit;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
});

test('Record, edit and discontinue a drug order', async ({ page }) => {
  const medicationsPage = new MedicationsPage(page);

  await test.step('When I visit the medications page', async () => {
    await medicationsPage.goTo(patient.uuid);
  });

  await test.step('And I click on the `Record active medications` link', async () => {
    await page.getByText(/record active medications/i).click();
  });

  await test.step('And I search for the drug in the search bar', async () => {
    await page.getByRole('searchbox', { name: /search for a drug or orderset/i }).fill('aspirin');
  });

  await test.step('And I click on the `Add to basket` button', async () => {
    await page
      .getByRole('listitem')
      .filter({ hasText: /aspirin 81mg — 81mg — tablet/i })
      .getByRole('button', { name: /add to basket/i })
      .click();
  });

  await test.step('And I click on the drug order form link', async () => {
    await page
      .getByRole('listitem')
      .filter({ hasText: /incomplete/i })
      .click();
  });

  await test.step('Then I should be redirected to the drug order form', async () => {
    await expect(page.getByText(/order form/i)).toBeVisible();
  });

  await test.step('When I set the does to `1` tablet', async () => {
    await medicationsPage.page.getByLabel(/^dose$/i).clear();
    await medicationsPage.page.getByLabel(/^dose$/i).fill('1');
  });

  await test.step('And I set the route to `Oral`', async () => {
    await medicationsPage.page.getByPlaceholder(/route/i).click();
    await medicationsPage.page.getByText('Oral', { exact: true }).click();
  });

  await test.step('And I set the frequency to `Once daily`', async () => {
    await medicationsPage.page.getByPlaceholder(/frequency/i).click();
    await medicationsPage.page.getByText('Once daily', { exact: true }).click();
  });

  await test.step('And I set duration to `3` days', async () => {
    await medicationsPage.page.getByLabel(/^duration$/i).clear();
    await medicationsPage.page.getByLabel(/^duration$/i).fill('3');
  });

  await test.step('And I set the indication to `Headache`', async () => {
    await medicationsPage.page.getByLabel(/indication/i).clear();
    await medicationsPage.page.getByLabel(/indication/i).fill('Headache');
  });

  await test.step('And I save the form', async () => {
    await page.getByRole('button', { name: /save order/i }).click();
    await page.getByRole('button', { name: /sign and close/i }).click();
  });

  await test.step('Then I should see a success toast notification', async () => {
    await expect(page.getByText(/placed order for aspirin/i)).toBeVisible();
  });

  await test.step('And I should see the newly added order in the list', async () => {
    const headerRow = medicationsPage.medicationsTable().locator('thead > tr');
    const dataRow = medicationsPage.medicationsTable().locator('tbody > tr');

    await expect(headerRow).toContainText(/start date/i);
    await expect(headerRow).toContainText(/details/i);
    await expect(dataRow).toContainText(/aspirin 81mg/i);
    await expect(dataRow).toContainText(/1 tablet/i);
    await expect(dataRow).toContainText(/oral/i);
    await expect(dataRow).toContainText(/once daily/i);
    await expect(dataRow).toContainText(/3 days/i);
    await expect(dataRow).toContainText(/indication headache/i);
  });

  await test.step('When I launch the overflow menu', async () => {
    await page.getByRole('button', { name: /options/i }).click();
  });

  await test.step('And I click on the `Modify` button', async () => {
    await page.getByRole('menuitem', { name: /modify/i }).click();
  });

  await test.step('And I change the dose to `2` tablets', async () => {
    await medicationsPage.page.getByLabel(/^dose$/i).clear();
    await medicationsPage.page.getByLabel(/^dose$/i).fill('2');
  });

  await test.step('And I change the duration to `5` days', async () => {
    await medicationsPage.page.getByLabel(/^duration$/i).clear();
    await medicationsPage.page.getByLabel(/^duration$/i).fill('5');
  });

  await test.step('And I change the route to `Inhalation`', async () => {
    await medicationsPage.page.getByPlaceholder(/route/i).click();
    await medicationsPage.page.getByText('Inhalation', { exact: true }).click();
  });

  await test.step('And I change the frequency to `Twice daily`', async () => {
    await medicationsPage.page.getByPlaceholder(/frequency/i).click();
    await medicationsPage.page.getByText('Twice daily', { exact: true }).click();
  });

  await test.step('And I change the indication to `Hypertension`', async () => {
    await medicationsPage.page.getByLabel(/indication/i).clear();
    await medicationsPage.page.getByLabel(/indication/i).fill('Hypertension');
  });

  await test.step('And I save the form', async () => {
    await page.getByRole('button', { name: /save order/i }).click();
    await page.getByRole('button', { name: /sign and close/i }).click();
  });

  await test.step('Then I should see a success toast notification', async () => {
    await expect(page.getByText(/updated aspirin 81mg/i)).toBeVisible();
  });

  await test.step('And I should see the updated order in the list', async () => {
    const headerRow = medicationsPage.medicationsTable().locator('thead > tr');
    const dataRow = medicationsPage.medicationsTable().locator('tbody > tr');

    await expect(headerRow.nth(0)).toContainText(/start date/i);
    await expect(headerRow.nth(0)).toContainText(/details/i);
    await expect(dataRow.nth(0)).toContainText(/aspirin 81mg/i);
    await expect(dataRow.nth(0)).not.toContainText(/1 tablet/i);
    await expect(dataRow.nth(0)).toContainText(/2 tablet/i);
    await expect(dataRow.nth(0)).not.toContainText(/oral/i);
    await expect(dataRow.nth(0)).toContainText(/inhalation/i);
    await expect(dataRow.nth(0)).not.toContainText(/once daily/i);
    await expect(dataRow.nth(0)).toContainText(/twice daily/i);
    await expect(dataRow.nth(0)).not.toContainText(/3 days/i);
    await expect(dataRow.nth(0)).toContainText(/5 days/i);
    await expect(dataRow.nth(0)).not.toContainText(/indication headache/i);
    await expect(dataRow.nth(0)).toContainText(/indication hypertension/i);
  });

  await test.step('When I launch the overflow menu', async () => {
    await page
      .getByRole('button', { name: /options/i })
      .nth(0)
      .click();
  });

  await test.step('And I click on the `Discontinue` button', async () => {
    await page.getByRole('menuitem', { name: /discontinue/i }).click();
  });

  await test.step('And I save the form', async () => {
    await page.getByRole('button', { name: /sign and close/i }).click();
  });

  await test.step('Then I should see a success toast notification', async () => {
    await expect(page.getByText(/discontinued aspirin 81mg/i)).toBeVisible();
  });

  await test.step('And the medications table should be empty', async () => {
    await expect(page.getByText(/There are no active medications to display for this patient/i)).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit.uuid);
  await deletePatient(api, patient.uuid);
});
