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

test('Add, edit and delete vital signs', async ({ page }) => {
  const vitalsPage = new BiometricsAndVitalsPage(page);
  const headerRow = vitalsPage.vitalsTable().locator('thead > tr');
  const dataRow = vitalsPage.vitalsTable().locator('tbody > tr');

  await test.step('When I visit the vitals and biometrics page', async () => {
    await vitalsPage.goTo(patient.uuid);
  });

  await test.step('And I click the `Record Vitals` link to launch the form', async () => {
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

  await test.step('And I fill `65` as the pulse', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /pulse/i }).fill('65');
  });

  await test.step('And I fill `16` as the respiration rate', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /respiration rate/i }).fill('16');
  });

  await test.step('And I fill `98` as the oxygen saturation', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /oxygen saturation/i }).fill('98');
  });

  await test.step('And I add additional notes', async () => {
    await vitalsPage.page.getByPlaceholder(/type any additional notes here/i).fill('Test notes');
  });

  await test.step('And I click on the `Save and close` button', async () => {
    await vitalsPage.page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(vitalsPage.page.getByText(/vitals and biometrics saved/i)).toBeVisible();
  });

  await test.step('And I should see the newly recorded vital signs on the page', async () => {
    await expect(headerRow).toContainText(/temp/i);
    await expect(headerRow).toContainText(/bp/i);
    await expect(headerRow).toContainText(/pulse/i);
    await expect(headerRow).toContainText(/r. rate/i);
    await expect(headerRow).toContainText(/SPO2/i);
    await expect(dataRow).toContainText('37');
    await expect(dataRow).toContainText('120 / 100');
    await expect(dataRow).toContainText('65');
    await expect(dataRow).toContainText('16');
    await expect(dataRow).toContainText('98');
  });

  await test.step('When I click the overflow menu in the table row with the newly added vitals', async () => {
    await vitalsPage.page
      .getByRole('button', { name: /options/i })
      .nth(0)
      .click();
  });

  await test.step('And I click the `Edit` button', async () => {
    await vitalsPage.page.getByRole('menuitem', { name: /edit/i }).click();
  });

  await test.step('Then I should see the vitals form launch in the workspace in edit mode', async () => {
    await expect(vitalsPage.page.getByText(/Edit vitals and biometrics/i)).toBeVisible();
  });

  await test.step('When I change the temperature to `42`', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /temperature/i }).clear();
    await vitalsPage.page.getByRole('spinbutton', { name: /temperature/i }).fill('42');
  });

  await test.step('When I change the pulse to `70`', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /pulse/i }).clear();
    await vitalsPage.page.getByRole('spinbutton', { name: /pulse/i }).fill('70');
  });

  await test.step('And I change the change the additional notes', async () => {
    await vitalsPage.page.getByPlaceholder(/type any additional notes here/i).clear();
    await vitalsPage.page.getByPlaceholder(/type any additional notes here/i).fill('Vitals test');
  });

  await test.step('And I click on the `Save and close` button', async () => {
    await vitalsPage.page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(vitalsPage.page.getByText(/vitals and biometrics updated/i)).toBeVisible();
  });

  await test.step('And I should see the newly edited vital signs on the page', async () => {
    await expect(headerRow).toContainText(/temp/i);
    await expect(headerRow).toContainText(/bp/i);
    await expect(headerRow).toContainText(/pulse/i);
    await expect(headerRow).toContainText(/r. rate/i);
    await expect(headerRow).toContainText(/SPO2/i);
    await expect(dataRow).toContainText('42');
    await expect(dataRow).toContainText('120 / 100');
    await expect(dataRow).toContainText('70');
    await expect(dataRow).toContainText('16');
    await expect(dataRow).toContainText('98');
  });

  await test.step('When I click the overflow menu in the table row with the newly edited vitals', async () => {
    await vitalsPage.page
      .getByRole('button', { name: /options/i })
      .nth(0)
      .click();
  });

  await test.step('And I click the `Delete` button', async () => {
    await vitalsPage.page.getByRole('menuitem', { name: /delete/i }).click();
  });

  await test.step('And I see the delete modal', async () => {
    await expect(vitalsPage.page.getByRole('heading', { name: /Delete Vitals and Biometrics/i })).toBeVisible();
  });

  await test.step('And I click the Delete button in the modal', async () => {
    await vitalsPage.page.getByRole('button', { name: /danger Delete/i }).click();
  });

  await test.step('Then I see the success notification', async () => {
    await expect(vitalsPage.page.getByText(/vitals and biometrics deleted/i)).toBeVisible();
  });

  await test.step('And the vitals table should be empty', async () => {
    await expect(vitalsPage.page.getByText(/there are no vital signs to display for this patient/i)).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit.uuid);
  await deletePatient(api, patient.uuid);
});
