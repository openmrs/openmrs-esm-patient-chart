import { type APIRequestContext, expect } from '@playwright/test';
import { test } from '../core';
import { GrowthChartPage } from '../pages/growth-chart-page';
import { deletePatient, generateRandomPatient } from '../commands';

test.describe('Growth Chart', () => {
  test('Growth Chart Unavailable for patients older than 5 years', async ({ page, patient }) => {
    const growthChartPage = new GrowthChartPage(page);

    await test.step('When I visit the Growth Chart page', async () => {
      await growthChartPage.goTo(patient.uuid);
    });

    await test.step('Then I should see the unavailable message', async () => {
      await expect(growthChartPage.growthChartUnavailableMessage()).toBeVisible();
    });
  });

  test('Growth Chart Visibility for patients less than 5 years', async ({ page, api }) => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 3);
    const birthdate = date.toISOString().split('T')[0];

    const youngPatient = await generateRandomPatient(api, birthdate);
    const growthChartPage = new GrowthChartPage(page);

    try {
      await test.step('When I visit the Growth Chart page for a patient less than 5 years old', async () => {
        await growthChartPage.goTo(youngPatient.uuid);
      });

      await test.step('Then I should see the Growth Chart dashboard', async () => {
        await expect(page.getByRole('heading', { name: /Weight for Age/i })).toBeVisible();
        await expect(page.getByRole('group', { name: /Data groups/i })).toBeVisible();
        await expect(page.getByRole('img', { name: /Weight for Age/i })).toBeVisible();
      });
    } finally {
      await deletePatient(api, youngPatient.uuid);
    }
  });
});
