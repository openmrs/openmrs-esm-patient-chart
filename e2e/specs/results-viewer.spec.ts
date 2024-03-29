import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import { generateRandomPatient, type Patient, startVisit, endVisit, deletePatient } from '../commands';
import { test } from '../core';
import { ResultsViewerPage, VisitsPage } from '../pages';

let patient: Patient;
let visit: Visit;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
});

test('Record and edit test results', async ({ page }) => {
  const resultsViewerPage = new ResultsViewerPage(page);
  const visitsPage = new VisitsPage(page);

  await test.step('When I visit the results viewer page', async () => {
    await resultsViewerPage.goTo(patient.uuid);
  });

  await test.step('And I click on the `Clinical forms` button on the siderail', async () => {
    await page.getByLabel(/clinical forms/i).click();
  });

  await test.step('Then I should see the clinical forms workspace', async () => {
    const headerRow = resultsViewerPage.formsTable().locator('thead > tr');

    await expect(page.getByPlaceholder(/search this list/i)).toBeVisible();
    await expect(headerRow).toContainText(/form name \(a-z\)/i);
    await expect(headerRow).toContainText(/last completed/i);
    await expect(page.getByRole('cell', { name: /laboratory test results/i })).toBeVisible();
  });

  await test.step('When I launch the `Laboratory Test Results` form', async () => {
    await page.getByText(/laboratory test results/i).click();
  });

  await test.step('Then it should launch in the workspace', async () => {
    await expect(page.getByRole('button', { name: /hematology/i, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Chemistry', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /other/i, exact: true })).toBeVisible();
  });

  await test.step('When I click the `Hematology` tab', async () => {
    await page.getByRole('button', { name: 'Hematology', exact: true }).click();
  });

  await test.step('And I fill the "Complete Blood Count" section', async () => {
    await page.locator('#ManualInputWhiteBloodCellsid').fill('12');
    await page.locator('#ManualEntryRedBloodCellsid').fill('15');
    await page.locator('#ManualEntryPlateletsid').fill('10');
    await page.locator('#ManualEntryNeutrophilsMicroscopicid').fill('10');
    await page.locator('#ManualEntryMCVid').fill('10');
    await page.locator('#ManualEntryMCHid').fill('10');
  });

  await test.step('When I click the `Chemistry` tab', async () => {
    await page.getByRole('button', { name: 'Chemistry', exact: true }).click();
  });

  await test.step('And I fill the "Chemistry Results" section', async () => {
    await page.locator('#ManualEntryAlkalinePhosphataseid').fill('10');
    await page.locator('#ManualEntryAmylaseid').fill('10');
    await page.locator('#ManualEntryBUNid').fill('10');
    await page.locator('#manualEntryFastingBloodGlucosemgdlid').fill('10');
    await page.locator('#manualEntryPostPrandialBloodGlucosemgdlid').fill('10');
    await page.locator('#manualEntrySerumAlbuminid').fill('10');
  });

  await test.step('When I click the `Other` tab', async () => {
    await page.getByRole('button', { name: 'Other', exact: true }).click();
  });

  await test.step('And I fill the "Urine" and "Stool" sections', async () => {
    await page.locator('#manualEntryCultureandSensitivityUrineid').fill('83%');
    await page.locator('#manualEntryUrinePregnancyTestid_1').check();
    await page.locator('#manualEntryUrineProteinDipStickid_0').check();
    await page.locator('#manualEntryUrineBacteriuriaTestid_1').check();
    await page.locator('#manualEntryErythrocytesPresenceInUrineSedimentByLightMicroscopyTestid_1').check();
    await page.locator('#manualEntryLeukocytesPresenceInUrineSedimentByLightMicroscopyid_2').check();
    await page.locator('#manualEntryEpithelialCastsPresenceInUrineSedimentByLightMicroscopyTestid_2').check();
    await page.locator('#manualEntryYeastPresenceInUrineSedimentByLightMicroscopyid_1').check();
    await page.locator('#manualEntrySporePresenceInUrineTestid_3').check();
    await page.locator('#manualEntryTrichomonasVaginalisPresenceInUrineSedimentByLightMicroscopyid_0').check();
    await page.locator('#manualEntryCrystalsTypeInUrineSedimentByLightMicroscopyTestid_3').check();
    await page.locator('#manualEntryStoolExamid').selectOption('Cestode Infection');
    await page.locator('#manualEntryStoolFatTestSemiQuantitativeid_3').check();
    await page.locator('#manualEntryStoolTestforReducingSubstanceid_0').check();
    await page.locator('#manualEntryFecalOccultBloodTestid_2').check();
  });

  await test.step('And I click on the `Save and close` button', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success toast notification', async () => {
    await expect(page.getByText('The form has been submitted successfully.')).toBeVisible();
  });

  await test.step('When I go to the results viewer page', async () => {
    await resultsViewerPage.goTo(patient.uuid);
  });

  await test.step('And I click on the `Panel` tab', async () => {
    await page.getByRole('tab', { name: /panel/i }).click();
  });

  await test.step('Then I should see the newly entered test results reflect in the results viewer', async () => {
    const whiteBloodCellRow = page.locator('tr:has-text("white blood cells")');
    const redBloodCellRow = page.locator('tr:has-text("red blood cells")');
    await expect(whiteBloodCellRow).toContainText(/12/i);
    await expect(redBloodCellRow).toContainText(/15/i);
  });

  await test.step('When I navigate to the `Visits` page', async () => {
    visitsPage.goTo(patient.uuid);
  });

  await test.step('And I go to the `All encounters` tab', async () => {
    await page.getByRole('tab', { name: /all encounters/i }).click();
  });

  await test.step('Then I should see the newly added test results included in the list', async () => {
    await expect(
      page.getByRole('cell', { name: /laboratory test results/i }).getByText('Laboratory Test Results'),
    ).toBeVisible();
  });

  await test.step('When I launch the overflow menu of the created test results', async () => {
    await page
      .getByRole('button', { name: /options/i })
      .nth(0)
      .click();
  });

  await test.step('And I click on the `Edit` button', async () => {
    await page.getByRole('menuitem', { name: /edit this encounter/i }).click();
  });

  await test.step('And I amend the values for "White blood cells" and "Red blood cells"', async () => {
    await page.locator('#ManualInputWhiteBloodCellsid').clear();
    await page.locator('#ManualInputWhiteBloodCellsid').fill('13');
    await page.locator('#ManualEntryRedBloodCellsid').clear();
    await page.locator('#ManualEntryRedBloodCellsid').fill('16');
  });

  await test.step('And I save the form', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success toast notification', async () => {
    await expect(page.getByText('The form has been submitted successfully.')).toBeVisible();
  });

  await test.step('When I revisit the `Results Viewer` page', async () => {
    await resultsViewerPage.goTo(patient.uuid);
  });

  await test.step('And I click on the `Panel` tab', async () => {
    await page.getByRole('tab', { name: /panel/i }).click();
  });

  await test.step('Then I should see the updated results reflect in the results viewer', async () => {
    const whiteBloodCellRow = page.locator('tr:has-text("white blood cells")');
    const redBloodCellRow = page.locator('tr:has-text("red blood cells")');
    await expect(whiteBloodCellRow).toContainText(/13/i);
    await expect(redBloodCellRow).toContainText(/16/i);
  });
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit.uuid);
  await deletePatient(api, patient.uuid);
});
