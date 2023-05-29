import { test } from '../core';
import { HomePage } from '../pages';
import { expect } from '@playwright/test';
import { deletePatient, generateRandomPatient, getPatient, Patient } from '../commands';

let patient: Patient;
test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});
test('should be able to see the active visits', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto(patient.uuid);
  await expect(page).toHaveTitle('OpenMRS');
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
