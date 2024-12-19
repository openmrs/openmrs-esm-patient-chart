import { test } from '../core';
import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import { generateRandomPatient, type Patient, startVisit, endVisit } from '../commands';
import { BiometricsAndVitalsPage } from '../pages';

let patient: Patient;
let visit: Visit;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
});

test('Flagging abnormal vitals', async ({ page }) => {
  const vitalsPage = new BiometricsAndVitalsPage(page);

  await test.step('Given I am on the vitals and biometrics page for the selected patient', async () => {
    await vitalsPage.goTo(patient.uuid);
  });

  await test.step('And I click on "Record vital signs"', async () => {
    await vitalsPage.page.getByText(/record vitals/i).click();
  });

  await test.step('Then the form to enter vitals details should be displayed', async () => {
    await expect(vitalsPage.page.getByText(/record vitals and biometrics/i)).toBeVisible();
  });

  await test.step('Then I enter abnormal temperature value', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /temperature/i }).fill('43.0');
  });

  await test.step('Then I enter abnormal systolic value', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /systolic/i }).fill('250');
  });

  await test.step('Then I enter abnormal diastolic value', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /diastolic/i }).fill('150');
  });

  await test.step('Then I enter abnormal pulse value', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /pulse/i }).fill('230');
  });

  await test.step('Then I enter abnormal respiration rate value', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /respiration rate/i }).fill('999');
  });

  await test.step('Then I enter abnormal oxygen saturation value', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /oxygen saturation/i }).fill('100');
  });

  await test.step('And then I click "Save and close"', async () => {
    await vitalsPage.page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then the system should save the vitals', async () => {
    await expect(vitalsPage.page.getByText(/vitals and biometrics saved/i)).toBeVisible();
  });

  await test.step('And then the system should flag the abnormal temperature value 43 ↑↑', async () => {
    await expect(vitalsPage.page.getByRole('cell', { name: '43 ↑↑' })).toBeVisible();
  });

  await test.step('And then the system should flag the abnormal diastolic value 150 ↑↑', async () => {
    await expect(vitalsPage.page.getByRole('cell', { name: '150 ↑↑' })).toBeVisible();
  });

  await test.step('And then the system should flag the abnormal pulse value 230 ↑↑', async () => {
    await expect(vitalsPage.page.getByRole('cell', { name: '230 ↑↑' })).toBeVisible();
  });

  await test.step('And then the system should flag the abnormal respiration rate value 999 ↑↑', async () => {
    await expect(vitalsPage.page.getByRole('cell', { name: '999 ↑↑' })).toBeVisible();
  });

  await test.step('And then the system should display the oxygen saturation value 100', async () => {
    await expect(vitalsPage.page.getByRole('cell', { name: '100' })).toBeVisible();
  });

  await test.step('And the flagged abnormal vitals should be visible in the Vitals section with thresholds exceeded', async () => {
    await expect(vitalsPage.page.getByText(/temp43 deg c/i)).toBeVisible();
    await expect(vitalsPage.page.getByText(/bp250 \/ 150 mmhg/i)).toBeVisible();
    await expect(vitalsPage.page.getByText(/heart rate230 beats\/min/i)).toBeVisible();
    await expect(vitalsPage.page.getByText(/r. rate999 breaths\/min/i)).toBeVisible();
  });
});
