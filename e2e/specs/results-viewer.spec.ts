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

test('Record and edit test result', async ({ page }) => {
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

  await test.step('Then I should see the laboratory test result form workspace', async () => {
    await expect(page.getByRole('button', { name: /hematology/i, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Chemistry', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /other/i, exact: true })).toBeVisible();
  });

  await test.step('When I click the `Hematology` tab', async () => {
    await page.getByRole('button', { name: 'Hematology', exact: true }).click();
  });

  await test.step('And I fill the complete blood count form', async () => {
    await page.locator('#ManualInputWhiteBloodCellsid').fill('12');
    await page.locator('#ManualEntryRedBloodCellsid').fill('15');
    await page.locator('#ManualEntryPlateletsid').fill('10');
    await page.locator('#ManualEntryNeutrophilsMicroscopicid').fill('10');
    await page.locator('#ManualEntryMCVid').fill('10');
    await page.locator('#ManualEntryMCHid').fill('10');
    await page.locator('#ManualEntryMCHCid').fill('10');
    await page.locator('#ManualEntryLymphocytesMicroscopicid').fill('10');
    await page.locator('#ManualEntryHematocritid').fill('10');
    await page.locator('#ManualEntryHaemoglobinid').fill('10');
    await page.locator('#ManualEntryCombinedPercentageMonocytesEosinophilsBasophilsid').fill('10');
  });

  await test.step('When I click the `Chemistry` tab', async () => {
    await page.getByRole('button', { name: 'Chemistry', exact: true }).click();
  });

  await test.step('And I fill the chemistry results form', async () => {
    await page.locator('#ManualEntryAlkalinePhosphataseid').fill('10');
    await page.locator('#ManualEntryAmylaseid').fill('10');
    await page.locator('#ManualEntryBUNid').fill('10');
    await page.locator('#manualEntryFastingBloodGlucosemgdlid').fill('10');
    await page.locator('#manualEntryPostPrandialBloodGlucosemgdlid').fill('10');
    await page.locator('#manualEntrySerumAlbuminid').fill('10');
    await page.locator('#manualEntrySerumCalciumid').fill('10');
    await page.locator('#manualEntrySerumPotassiumid').fill('10');
    await page.locator('#manualEntrySerumSodiumid').fill('10');
    await page.locator('#manualEntrySerumCreatinineid').fill('10');
    await page.locator('#manualEntryTotalProteinid').fill('10');
    await page.locator('#manualEntrySerumGlucosemgdlid').fill('10');
    await page.locator('#manualEntrySerumGlucosemmolid').fill('10');
    await page.locator('#manualEntryTotalBilirubinid').fill('10');
    await page.locator('#manualEntrySerumGlutamicOxaloaceticTransaminaseid').fill('10');
    await page.locator('#manualEntryAlkalinePhosphastaseid').fill('10');
    await page.locator('#manualEntrySerumUricAcidid').fill('10');
    await page.locator('#manualEntryTotalCholesterolid').fill('10');
    await page.locator('#manualEntryTriglyceridesid').fill('10');
    await page.locator('#manualEntryAmylaseid').fill('10');
    await page.locator('#manualEntrySerumCarbonDioxideid').fill('10');
  });

  await test.step('When I click the `Other` tab', async () => {
    await page.getByRole('button', { name: 'Other', exact: true }).click();
  });

  await test.step('And I fill the other test results', async () => {
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
    await page.locator('#manualEntryStoolCultureBacterialid').fill('no signs');
    await page.locator('#manualEntryStoolExamid').selectOption('Cestode Infection');
    await page.locator('#manualEntryStoolMicroscopyWithConcentrationid').fill('no signs');
    await page.locator('#manualEntryKinyounsStainForCoccidiansid').fill('no signs');
    await page.locator('#manualEntryStoolFatTestSemiQuantitativeid_3').check();
    await page.locator('#manualEntryStoolTestforReducingSubstanceid_0').check();
    await page.locator('#manualEntryFecalOccultBloodTestid_2').check();
  });

  await test.step('And I save the form', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success toast notification', async () => {
    await expect(page.getByText('The form has been submitted successfully.')).toBeVisible();
  });

  await test.step('When I reload the viewer page', async () => {
    await resultsViewerPage.goTo(patient.uuid);
  });

  await test.step('Then I should see 12 and 15 as white and red blood cells test results displayed respectively', async () => {
    await expect(page.getByRole('link', { name: /white blood cells/i })).toBeVisible();
    await expect(page.getByText('12', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /red blood cells/i })).toBeVisible();
    await expect(page.getByText('15', { exact: true })).toBeVisible();
  });

  await test.step('When I navigate to `Visits` page', async () => {
    visitsPage.goTo(patient.uuid);
  });

  await test.step('And I go to the `All encounters` tab', async () => {
    await page.getByRole('tab', { name: /all encounters/i }).click();
  });

  await test.step('Then I should see the newly added lab test result in the list', async () => {
    await expect(
      page.getByRole('cell', { name: /laboratory test results/i }).getByText('Laboratory Test Results'),
    ).toBeVisible();
  });

  await test.step('When I launch the overflow menu of the created lab test result', async () => {
    await page
      .getByRole('button', { name: /options/i })
      .nth(0)
      .click();
  });

  await test.step('And I click on the `Edit` button', async () => {
    await page.getByRole('menuitem', { name: /edit this encounter/i }).click();
  });

  await test.step('And I change the white and red blood cells test results to `13` and `16` respectively', async () => {
    await page.locator('#ManualInputWhiteBloodCellsid').fill('13');
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

  await test.step('Then I should see `13` and `16` as white and red blood cells test results respectively', async () => {
    await expect(page.getByRole('link', { name: /white blood cells/i })).toBeVisible();
    await expect(page.getByText('13', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /red blood cells/i })).toBeVisible();
    await expect(page.getByText('16', { exact: true })).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit.uuid);
  await deletePatient(api, patient.uuid);
});
