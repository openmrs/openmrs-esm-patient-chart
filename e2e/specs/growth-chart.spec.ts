import { type APIRequestContext, expect } from '@playwright/test';
import { test } from '../core';
import { GrowthChartPage } from '../pages/growth-chart-page';
import { deletePatient, generateRandomPatient } from '../commands';

test.describe('Growth Chart', () => {
  test('Growth Chart Unavailable for patients older than 5 years', async ({ page, api }) => {
    const growthChartPage = new GrowthChartPage(page);
    let patient;

    await test.step('Given I have a patient older than 5 years', async () => {
      const birthYear = new Date().getFullYear() - 10;
      patient = await generateRandomPatient(api, `${birthYear}-01-01`);
    });

    try {
      await test.step('When I visit the Growth Chart page', async () => {
        await growthChartPage.goTo(patient.uuid);
      });

      await test.step('Then I should see the unavailable message', async () => {
        await expect(growthChartPage.growthChartUnavailableMessage()).toBeVisible();
      });
    } finally {
      await deletePatient(api, patient.uuid);
    }
  });

  test('Growth Chart Visibility for patients less than 5 years', async ({ page, api }) => {
    const growthChartPage = new GrowthChartPage(page);
    let patient;

    await test.step('Given I have a patient younger than 5 years', async () => {
      const birthYear = new Date().getFullYear() - 3;
      patient = await generateRandomPatient(api, `${birthYear}-01-01`);
    });

    try {
      await test.step('When I visit the Growth Chart page for a patient less than 5 years old', async () => {
        await growthChartPage.goTo(patient.uuid);
      });

      await test.step('Then I should see the Growth Chart dashboard', async () => {
        await expect(page.getByRole('heading', { name: /Weight for Age/i })).toBeVisible();
        await expect(page.getByRole('group', { name: /Data groups/i })).toBeVisible();
        await expect(page.getByRole('img', { name: /Weight for Age/i })).toBeVisible();
      });
    } finally {
      await deletePatient(api, patient.uuid);
    }
  });
});
