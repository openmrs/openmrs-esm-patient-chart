import { expect } from '@playwright/test';
import { test } from '../core';
import { generateRandomPatient, deletePatient } from '../commands';
import { startVisit } from '../commands/visit-operations';
import { ChartPage } from '../pages';

test('Visit context updates correctly when navigating between patients with active visits', async ({
  page,
  api,
  patient,
}) => {
  const chartPage = new ChartPage(page);
  const patient2 = await generateRandomPatient(api);

  try {
    await test.step('Setup: Start an active visit for the second patient', async () => {
      await startVisit(api, patient2.uuid);
    });

    await test.step("When I visit Patient 1's chart", async () => {
      await chartPage.goTo(patient.uuid);
    });

    await test.step("Then I should see Patient 1's active visit tag", async () => {
      await expect(page.getByLabel(/active visit/i)).toBeVisible();
    });

    await test.step("When I navigate to Patient 2's chart", async () => {
      await chartPage.goTo(patient2.uuid);
    });

    await test.step("Then I should see Patient 2's active visit tag", async () => {
      await expect(page.getByLabel(/active visit/i)).toBeVisible();
    });

    await test.step('And I should see the `End active visit` option in the actions menu', async () => {
      await page.getByRole('button', { name: /actions/i }).click();
      await expect(page.getByRole('menuitem', { name: /end active visit/i })).toBeVisible();
    });

    await test.step("When I navigate back to Patient 1's chart", async () => {
      await chartPage.goTo(patient.uuid);
    });

    await test.step("Then Patient 1's active visit tag should still be visible", async () => {
      await expect(page.getByLabel(/active visit/i)).toBeVisible();
    });
  } finally {
    await deletePatient(api, patient2.uuid);
  }
});

test('Visit context clears when navigating from patient with visit to patient without visit', async ({
  page,
  api,
  patient,
}) => {
  const chartPage = new ChartPage(page);
  const patientWithoutVisit = await generateRandomPatient(api);

  try {
    await test.step('When I visit the chart of the patient with an active visit', async () => {
      await chartPage.goTo(patient.uuid);
    });

    await test.step('Then I should see the active visit tag', async () => {
      await expect(page.getByLabel(/active visit/i)).toBeVisible();
    });

    await test.step('When I navigate to the chart of the patient without a visit', async () => {
      await chartPage.goTo(patientWithoutVisit.uuid);
    });

    await test.step('Then I should not see the active visit tag', async () => {
      await expect(page.getByLabel(/active visit/i)).toBeHidden();
    });

    await test.step('And visit-dependent actions should prompt for visit creation', async () => {
      await page.getByRole('button', { name: /note/i }).click();
      await expect(page.getByText(/no active visit/i)).toBeVisible();
    });
  } finally {
    await deletePatient(api, patientWithoutVisit.uuid);
  }
});
