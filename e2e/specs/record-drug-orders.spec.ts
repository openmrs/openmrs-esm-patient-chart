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

test('Order a drug', async ({ page, api }) => {
  const medicationsPage = new MedicationsPage(page);

  await test.step('When I visit the medications page', async () => {
    await medicationsPage.goTo(patient.uuid);
  });

  await test.step('And I click on the `Record active medications` link', async () => {
    await medicationsPage.page.getByText(/record active medications/i).click();
  });

  await test.step('And I record a medication', async () => {
    await expect(medicationsPage.page.getByText(/add drug order/i)).toBeVisible();
    await medicationsPage.page.getByRole('searchbox', { name: /search for a drug or orderset/i }).fill('aspirin');
    await expect(medicationsPage.page.getByText(/6 results for "aspirin"/)).toBeVisible();
    await medicationsPage.page
      .getByRole('listitem')
      .filter({ hasText: /aspirin 81mg — 81mg — tablet/i })
      .getByRole('button', { name: /add to basket/i })
      .click();

    await expect(medicationsPage.page.getByRole('heading', { name: 'Drug orders (1)' })).toBeVisible();
    await medicationsPage.page
      .getByRole('listitem')
      .filter({ hasText: /incomplete/i })
      .click();

    await expect(medicationsPage.page.getByRole('button', { name: /back to order basket/i })).toBeVisible();
    await medicationsPage.page.getByLabel(/^dose$/i).fill('1');
    await medicationsPage.page.getByLabel(/^duration$/i).fill('3');
    await medicationsPage.page.getByPlaceholder(/route/i).click();
    await medicationsPage.page.getByText('Oral', { exact: true }).click();
    await medicationsPage.page.getByPlaceholder(/frequency/i).click();
    await medicationsPage.page.getByText('Once daily', { exact: true }).click();
    await medicationsPage.page.getByLabel(/indication/i).fill('Headache');
    await medicationsPage.page.getByRole('button', { name: /save order/i }).click();
    await medicationsPage.page.getByRole('button', { name: /sign and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(medicationsPage.page.getByText(/placed order for aspirin/i)).toBeVisible();
  });

  await test.step('And I should see the newly added order in the list', async () => {
    const headerRow = medicationsPage.medicationsTable().locator('thead > tr');
    const dataRow = medicationsPage.medicationsTable().locator('tbody > tr');

    await expect(headerRow).toContainText(/start date/i);
    await expect(headerRow).toContainText(/details/i);
    await expect(dataRow).toContainText(/aspirin 81mg/i);
    await expect(dataRow).toContainText(/3 days/i);
    await expect(dataRow).toContainText(/indication headache/i);
  });
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit.uuid);
  await deletePatient(api, patient.uuid);
});
