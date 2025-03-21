import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import { test } from '../core';
import { type Patient, generateRandomPatient, startVisit, endVisit, deletePatient } from '../commands';
import { ChartPage, VisitsPage } from '../pages';
import { get } from 'lodash';

let patient: Patient;
let visit: Visit;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
});

test('Add and delete a visit note', async ({ page }) => {
  const chartPage = new ChartPage(page);
  const visitsPage = new VisitsPage(page);

  await test.step('When I visit the chart summary page', async () => {
    await chartPage.goTo(patient.uuid);
  });

  await test.step('And I click the `Visit note` button on the siderail', async () => {
    await page.getByLabel(/visit note/i).click();
  });

  await test.step('Then I should see the visit note form launch in the workspace', async () => {
    await expect(page.getByText('Visit Note', { exact: true })).toBeVisible();
  });

  await test.step('When I select `Asthma` as the primary diagnosis', async () => {
    await page.getByPlaceholder('Choose a primary diagnosis').fill('Asthma');
    await page.getByRole('menuitem', { name: 'Asthma', exact: true }).click();
  });

  await test.step('And I select `Infection by Ascaris Lumbricoides` as the secondary diagnosis', async () => {
    await page.getByPlaceholder('Choose a secondary diagnosis').fill('Infection by Ascaris Lumbricoides');
    await page.getByRole('menuitem', { name: /infection by ascaris lumbricoides/i }).click();
  });

  await test.step('And I add a visit note', async () => {
    await page.getByPlaceholder('Write any notes here').fill('This is a note');
  });

  await test.step('And I click on the `Save and close` button', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/visit note saved/i)).toBeVisible();
  });

  await test.step('When I navigate to the visits dashboard Summary Cards view', async () => {
    await visitsPage.goTo(patient.uuid);
    await page.getByRole('tab', { name: /summary cards/i }).click();
  });

  await test.step('Then I should see the newly added visit note added to the list', async () => {
    await expect(page.getByText(/asthma/i)).toBeVisible();
    await expect(page.getByText(/infection by ascaris lumbricoides/i)).toBeVisible();
    await expect(page.getByText(/this is a note/i)).toBeVisible();
  });

  await test.step('When I click the `All encounters` tab', async () => {
    await page.getByRole('tab', { name: /all encounters/i }).click();
  });

  await test.step('And I click the overflow menu in the table row of the newly added visit note', async () => {
    await page
      .getByRole('button', { name: /options/i })
      .nth(0)
      .click();
  });

  await test.step('And I click on the `Delete this encounter` button', async () => {
    await page.getByRole('menuitem', { name: /delete this encounter/i }).click();
    await page.getByRole('button', { name: /delete/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/encounter deleted/i)).toBeVisible();
  });

  await test.step('And the encounters table should be empty', async () => {
    await expect(
      page.getByLabel(/all encounters/i).getByText(/there are no encounters to display for this patient/i),
    ).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit);
  await deletePatient(api, patient.uuid);
});
