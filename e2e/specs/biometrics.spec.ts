import { test } from '../core';
import { BiometricsAndVitalsPage } from '../pages';
import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, Patient, startVisit, endVisit } from '../commands';
import { Visit } from '@openmrs/esm-framework';

let patient: Patient;
let visit: Visit;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
});

test('Record biometrics', async ({ page, api }) => {
  const biometricsPage = new BiometricsAndVitalsPage(page);

  await test.step('When I visit the vitals and biometrics page', async () => {
    await biometricsPage.goTo(patient.uuid);
  });

  await test.step('And I click the `Record biometrics` link to launch the form', async () => {
    await biometricsPage.page.getByText(/record biometrics/i).click();
  });

  await test.step('And then I fill the form', async () => {
    await biometricsPage.page.getByRole('spinbutton', { name: /height/i }).fill('170');
    await biometricsPage.page.getByRole('spinbutton', { name: /Weight/i }).fill('65');
    await expect(biometricsPage.page.getByRole('spinbutton', { name: /bmi/i })).toHaveValue('22.5');
    await biometricsPage.page.getByRole('spinbutton', { name: /muac/i }).fill('25');
  });

  await test.step('And I click the submit button', async () => {
    await biometricsPage.page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success toast notification', async () => {
    await expect(biometricsPage.page.getByText(/vitals and biometrics saved/i)).toBeVisible();
  });

  await test.step('And I should see the newly recorded biometrics on the page', async () => {
    const headerRow = biometricsPage.biometricsTable().locator('thead > tr');
    await expect(headerRow).toContainText(/weight/i);
    await expect(headerRow).toContainText(/height/i);
    await expect(headerRow).toContainText(/bmi/i);
    await expect(headerRow).toContainText(/muac/i);

    const dataRow = biometricsPage.biometricsTable().locator('tbody > tr');
    await expect(dataRow).toContainText('65');
    await expect(dataRow).toContainText('170');
    await expect(dataRow).toContainText('22.5');
    await expect(dataRow).toContainText('25');
  });
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit.uuid);
  await deletePatient(api, patient.uuid);
});
