import { expect } from '@playwright/test';
import { deletePatient, generateRandomPatient, type Patient } from '../commands';
import { test } from '../core';
import { ChartPage } from '../pages';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('Close patient chart', async ({ page }) => {
  const chartPage = new ChartPage(page);
  const topNav = page.getByRole('banner', { name: 'OpenMRS' });
  const closeButton = topNav.getByRole('button', { name: /close patient chart/i });

  await test.step('When I visit the patient chart', async () => {
    await chartPage.goTo(patient.uuid);
  });

  await test.step('Then clicking on it should take me home, making the close button disappear', async () => {
    await closeButton.click();
    await expect(page.url()).toMatch(/.*\/spa\/home/);
    await expect(closeButton).toBeHidden();
  });

  await test.step('When I visit the patient chart again and navigate to several pages within it', async () => {
    await chartPage.goTo(patient.uuid);
    await page.getByRole('link', { name: /medications/i }).click();
    await page.getByRole('link', { name: /orders/i }).click();
    await page.getByRole('link', { name: /results/i }).click();
  });

  await test.step('Then clicking on close button should take me home again', async () => {
    await closeButton.click();
    await expect(page.url()).toMatch(/.*\/spa\/home/);
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
