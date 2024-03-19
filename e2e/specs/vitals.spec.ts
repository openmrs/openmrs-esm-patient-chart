import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import { generateRandomPatient, deletePatient, type Patient, startVisit, endVisit } from '../commands';
import { test } from '../core';
import { BiometricsAndVitalsPage } from '../pages';

let patient: Patient;
let visit: Visit;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
});

test('Record vital signs', async ({ page }) => {
  const vitalsPage = new BiometricsAndVitalsPage(page);
  const headerRow = vitalsPage.vitalsTable().locator('thead > tr');
  const dataRow = vitalsPage.vitalsTable().locator('tbody > tr');

  await test.step('When I visit the vitals and biometrics page', async () => {
    await vitalsPage.goTo(patient.uuid);
  });

  await test.step('And I click the `Record biometrics` link to launch the form', async () => {
    await vitalsPage.page.getByText(/record vital signs/i).click();
  });

  await test.step('Then I should see the `Record Vitals and Biometrics` form launch in the workspace', async () => {
    await expect(vitalsPage.page.getByText(/record vitals and biometrics/i)).toBeVisible();
  });

  await test.step('When I fill `37` as the temperature', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /temperature/i }).fill('37');
  });

  await test.step('And I fill `120` as the systolic', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /systolic/i }).fill('120');
  });

  await test.step('And I fill `100` as the diastolic', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /diastolic/i }).fill('100');
  });

  await test.step('And I fill `37` as the pulse', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /pulse/i }).fill('65');
  });

  await test.step('And I fill `37` as the respiration rate', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /respiration rate/i }).fill('16');
  });

  await test.step('And I fill `37` as the oxygen saturation', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /oxygen saturation/i }).fill('98');
  });

  await test.step('And I add `37` as the oxygen saturation', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /oxygen saturation/i }).fill('98');
  });

  await test.step('And I add additional notes', async () => {
    await vitalsPage.page.getByPlaceholder(/type any additional notes here/i).fill('Test notes');
  });

  await test.step('And I click on the `Save and close` button', async () => {
    await vitalsPage.page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success toast notification', async () => {
    await expect(vitalsPage.page.getByText(/vitals and biometrics saved/i)).toBeVisible();
  });

  await test.step('And I should see the newly recorded vital signs on the page', async () => {
    await expect(headerRow).toContainText(/temp/i);
    await expect(headerRow).toContainText(/blood pressure/i);
    await expect(headerRow).toContainText(/pulse/i);
    await expect(headerRow).toContainText(/r. rate/i);
    await expect(headerRow).toContainText(/SPO2/i);
    await expect(dataRow).toContainText('37');
    await expect(dataRow).toContainText('120 / 100');
    await expect(dataRow).toContainText('65');
    await expect(dataRow).toContainText('16');
    await expect(dataRow).toContainText('98');
  });
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit.uuid);
  await deletePatient(api, patient.uuid);
});
