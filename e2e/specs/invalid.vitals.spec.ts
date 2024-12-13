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

test('Flagging abnormal vitals in the Patient Chart', async ({ page }) => {
  const biometricsPage = new BiometricsAndVitalsPage(page);

  await test.step('When I visit the vitals and biometrics page', async () => {
    await biometricsPage.goTo(patient.uuid);
  });

  await test.step('When the user navigates to the "Vitals & Biometrics" section', async () => {
    await biometricsPage.goTo(patient.uuid);
  });

  await test.step('And clicks on "Add New Vital/Biometric"', async () => {
    await biometricsPage.page.getByText(/record biometrics/i).click();
  });

  await test.step('Then a form to enter vitals/biometrics details should be displayed', async () => {
    await expect(biometricsPage.page.getByText(/record vitals and biometrics/i)).toBeVisible();
  });

  await test.step('When the user enters abnormal vitals/biometric values', async () => {
    await biometricsPage.page.getByRole('spinbutton', { name: /temperature/i }).fill('43.0');
    await biometricsPage.page.getByRole('spinbutton', { name: /systolic/i }).fill('250');
    await biometricsPage.page.getByRole('spinbutton', { name: /diastolic/i }).fill('150');
    await biometricsPage.page.getByRole('spinbutton', { name: /pulse/i }).fill('230');
    await biometricsPage.page.getByRole('spinbutton', { name: /respiration rate/i }).fill('999');
    await biometricsPage.page.getByRole('spinbutton', { name: /oxygen saturation/i }).fill('100');
  });

  await test.step('And clicks "Save and close"', async () => {
    await biometricsPage.page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then the system should save the vitals/biometrics', async () => {
    await expect(biometricsPage.page.getByText(/vitals and biometrics saved/i)).toBeVisible();
  });

  await test.step('And the system should flag the abnormal values based on predefined thresholds', async () => {
    await expect(biometricsPage.page.getByRole('cell', { name: '43 ↑↑' })).toBeVisible();
    await expect(biometricsPage.page.getByRole('cell', { name: '/ 150 ↑↑' })).toBeVisible();
    await expect(biometricsPage.page.getByRole('cell', { name: '230 ↑↑' })).toBeVisible();
    await expect(biometricsPage.page.getByRole('cell', { name: '999 ↑↑' })).toBeVisible();
  });

  await test.step('And the abnormal vitals/biometrics should be visible in the "Vitals & Biometrics" section with indications they exceed normal thresholds', async () => {
    await expect(biometricsPage.page.getByText(/temp43 deg c/i)).toBeVisible();
    await expect(biometricsPage.page.getByText(/bp250 \/ 150 mmhg/i)).toBeVisible();
    await expect(biometricsPage.page.getByText(/heart rate230 beats\/min/i)).toBeVisible();
    await expect(biometricsPage.page.getByText(/r. rate999 breaths\/min/i)).toBeVisible();
  });
});
