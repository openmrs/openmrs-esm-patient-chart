import { expect } from '@playwright/test';
import { test } from '../core';
import { type Patient, generateRandomPatient, deletePatient } from '../commands';
import { startVisit } from '../commands/visit-operations';
import { ChartPage } from '../pages';

test('Visit context updates correctly when navigating between patients with active visits', async ({ page, api }) => {
  const chartPage = new ChartPage(page);
  let patient1: Patient;
  let patient2: Patient;

  await test.step('Setup: Create two patients with active visits', async () => {
    patient1 = await generateRandomPatient(api);
    patient2 = await generateRandomPatient(api);

    await startVisit(api, patient1.uuid);
    await startVisit(api, patient2.uuid);
  });

  await test.step("When I visit the Patient 1's chart", async () => {
    await chartPage.goTo(patient1.uuid);
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
    await chartPage.goTo(patient1.uuid);
  });

  await test.step("Then Patient 1's active visit tag should still be visible", async () => {
    await expect(page.getByLabel(/active visit/i)).toBeVisible();
  });

  await test.step('Cleanup: Delete test patients', async () => {
    await deletePatient(api, patient1.uuid);
    await deletePatient(api, patient2.uuid);
  });
});

test('Visit context clears when navigating from patient with visit to patient without visit', async ({ page, api }) => {
  const chartPage = new ChartPage(page);
  let patientWithVisit: Patient;
  let patientWithoutVisit: Patient;

  await test.step('Setup: Create one patient with visit, one without', async () => {
    patientWithVisit = await generateRandomPatient(api);
    patientWithoutVisit = await generateRandomPatient(api);

    await startVisit(api, patientWithVisit.uuid);

    const res = await api.get(`visit?patient=${patientWithoutVisit.uuid}&active=true`);
    const data = await res.json();
    for (const visit of data.results) {
      await api.post(`visit/${visit.uuid}`, { data: { voided: true } });
    }
  });

  await test.step('When I visit the chart of the patient with an active visit', async () => {
    await chartPage.goTo(patientWithVisit.uuid);
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

  await test.step('Cleanup: Delete test patients', async () => {
    await deletePatient(api, patientWithVisit.uuid);
    await deletePatient(api, patientWithoutVisit.uuid);
  });
});
