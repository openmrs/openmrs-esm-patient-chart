import { expect } from '@playwright/test';
import { test } from '../core';
import { ChartPage, VisitsPage } from '../pages';

const subjectiveFindings = `I've had a headache for the last two days`;
const objectiveFindings = `General appearance is healthy. No signs of distress. Head exam shows no abnormalities, no tenderness on palpation. Neurological exam is normal; cranial nerves intact, normal gait and coordination.`;
const assessment = `Diagnosis: Tension-type headache. Differential Diagnoses: Migraine, sinusitis, refractive error.`;
const plan = `Advise use of over-the-counter ibuprofen as needed for headache pain. Educate about proper posture during reading and screen time; discuss healthy sleep hygiene. Schedule a follow-up appointment in 2 weeks or sooner if the headache becomes more frequent or severe.`;

test('Fill a clinical form', async ({ page, patient }) => {
  const chartPage = new ChartPage(page);
  const visitsPage = new VisitsPage(page);

  await test.step('When I visit the chart summary page', async () => {
    await chartPage.goTo(patient.uuid);
  });

  await test.step('And I click the `Clinical forms` button on the siderail', async () => {
    await page.getByLabel(/clinical forms/i, { exact: true }).click();
  });

  await test.step('Then I should see the clinical forms workspace', async () => {
    const headerRow = chartPage.formsTable().locator('thead > tr');

    await expect(page.getByPlaceholder(/search this list/i)).toBeVisible();
    await expect(headerRow).toContainText(/form name \(a-z\)/i);
    await expect(headerRow).toContainText(/last completed/i);

    await expect(page.getByRole('cell', { name: 'Covid 19', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: /laboratory test results/i, exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: /soap note template/i, exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: /surgical operation/i, exact: true })).toBeVisible();
  });

  await test.step('When I click the `Soap note template` link to launch the form', async () => {
    await page.getByText(/soap note template/i).click();
  });

  await test.step('Then I should see the `Soap note template` form launch in the workspace', async () => {
    await expect(page.getByText(/soap note template/i)).toBeVisible();
  });

  await test.step('When I fill the `Subjective findings` question', async () => {
    await page.getByLabel(/subjective findings/i).fill(subjectiveFindings);
  });

  await test.step('And I fill the `Objective findings` question', async () => {
    await page.getByLabel(/objective findings/i).fill(objectiveFindings);
  });

  await test.step('And I fill the `Assessment` question', async () => {
    await page.getByLabel(/assessment/i).fill(assessment);
  });

  await test.step('And I fill the `Plan` question', async () => {
    await page.getByLabel(/plan/i).fill(plan);
  });

  await test.step('And I click the `Order basket` button on the siderail', async () => {
    await page.locator('[data-extension-id="order-basket-action-menu"] button').click();
  });

  await test.step('And I click the `Add +` button to order drugs', async () => {
    await page.getByRole('button', { name: /add/i }).nth(1).click();
  });

  await test.step('And I click the `Clinical forms` button on the siderail', async () => {
    await page.getByLabel(/clinical forms/i, { exact: true }).click();
  });

  await test.step('Then I should see retained inputs in `Soap note template` form', async () => {
    await expect(page.getByText(subjectiveFindings)).toBeVisible();
    await expect(page.getByText(objectiveFindings)).toBeVisible();
    await expect(page.getByText(assessment)).toBeVisible();
    await expect(page.getByText(plan)).toBeVisible();
  });

  await test.step('And I click on the `Save and close` button', async () => {
    await page.getByRole('button', { name: /save/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/form submitted successfully/i)).toBeVisible();
  });

  await test.step('And if I navigate to the visits dashboard', async () => {
    await visitsPage.goTo(patient.uuid);
  });

  await test.step('Then I should see the newly filled form in the encounters table', async () => {
    await expect(page.getByRole('tab', { name: /visits/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /all encounters/i })).toBeVisible();

    await page.getByRole('tab', { name: /^all encounters$/i }).click();

    const headerRow = page.getByRole('table').locator('thead > tr');

    await expect(headerRow).toContainText(/date & time/i);
    await expect(headerRow).toContainText(/encounter type/i);
    await expect(headerRow).toContainText(/provider/i);

    await page.getByRole('button', { name: /expand all rows/i }).click();

    await expect(page.getByText(subjectiveFindings)).toBeVisible();
    await expect(page.getByText(objectiveFindings)).toBeVisible();
    await expect(page.getByText(assessment)).toBeVisible();
    await expect(page.getByText(plan)).toBeVisible();
  });
});

test('Fill a form with a browser slightly ahead of time', async ({ page, patient }) => {
  const chartPage = new ChartPage(page);
  const visitsPage = new VisitsPage(page);
  await page.clock.fastForward('01:00'); // Advances the time by 1 minute in the testing environment.

  await test.step('When I visit the chart summary page', async () => {
    await chartPage.goTo(patient.uuid);
  });

  await test.step('And I click the `Clinical forms` button on the siderail', async () => {
    await page.getByLabel(/clinical forms/i, { exact: true }).click();
  });

  await test.step('Then I should see `Laboratory Test Results` listed in the clinical forms workspace', async () => {
    await expect(page.getByRole('cell', { name: /laboratory test results/i, exact: true })).toBeVisible();
  });

  await test.step('When I click the `Laboratory Test Results` link to launch the form', async () => {
    await page.getByText(/laboratory test results/i).click();
  });

  await test.step('Then I should see the `Laboratory Test Results` form launch in the workspace', async () => {
    await expect(page.getByText(/laboratory test results/i)).toBeVisible();
  });

  await test.step('When I fill the `White Blood Cells (WBC)` result as `5000', async () => {
    await page.locator('#ManualInputWhiteBloodCells').fill('5500');
  });

  await test.step('And I fill the `Neutrophils` result as `35`', async () => {
    await page.locator('#ManualEntryNeutrophilsMicroscopic').fill('35');
  });

  await test.step('And I fill the `Hematocrit` result as `18`', async () => {
    await page.locator('#ManualEntryHematocrit').fill('18');
  });

  await test.step('And I click on the `Save` button', async () => {
    await page.getByRole('button', { name: /save/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/form submitted successfully/i)).toBeVisible();
  });

  await test.step('And I should not see any error messages', async () => {
    await expect(page.getByText('error')).toBeHidden();
  });
});

test('Form state is retained when moving between forms in the workspace', async ({ page, patient }) => {
  const chartPage = new ChartPage(page);

  await test.step('When I visit the chart summary page', async () => {
    await chartPage.goTo(patient.uuid);
  });

  await test.step('And I click the `Clinical forms` button on the siderail', async () => {
    await page.getByLabel(/clinical forms/i, { exact: true }).click();
  });

  await test.step('Then I should see `Soap note template` listed in the clinical forms workspace', async () => {
    await expect(page.getByRole('cell', { name: /soap note template/i, exact: true })).toBeVisible();
  });

  await test.step('When I click the `Soap note template` link to launch the form', async () => {
    await page.getByText(/soap note template/i).click();
  });

  await test.step('Then I should see the `Soap note template` form launch in the workspace', async () => {
    await expect(page.getByText(/soap note template/i)).toBeVisible();
  });

  await test.step('When I fill the `Subjective findings` and `Objective findings` questions', async () => {
    await page.getByLabel(/subjective Findings/i).fill(subjectiveFindings);
    await page.getByLabel(/objective findings/i).fill(objectiveFindings);
  });

  await test.step('And I click the `Order basket` button on the siderail', async () => {
    await page.locator('[data-extension-id="order-basket-action-menu"] button').click();
  });

  await test.step('And I click the `Add +` button to order drugs', async () => {
    await page.getByRole('button', { name: /add/i }).nth(1).click();
  });

  await test.step('And I click the `Clinical forms` button on the siderail', async () => {
    await page.getByLabel(/clinical forms/i, { exact: true }).click();
  });

  await test.step('Then I should see retained inputs in `Soap note template` form', async () => {
    await page.locator('#SOAPSubjectiveFindings').waitFor();
    await expect(page.getByText(subjectiveFindings)).toBeVisible();
    await expect(page.getByText(objectiveFindings)).toBeVisible();
  });
});

test('Form state is retained when minimizing a form in the workspace', async ({ page, patient }) => {
  const chartPage = new ChartPage(page);

  await test.step('When I visit the chart summary page', async () => {
    await chartPage.goTo(patient.uuid);
  });

  await test.step('And I click the `Clinical forms` button on the siderail', async () => {
    await page.getByLabel(/clinical forms/i, { exact: true }).click();
  });

  await test.step('Then I should see the `Laboratory Test Results` form listed in the clinical forms workspace', async () => {
    await expect(page.getByRole('cell', { name: /laboratory test results/i, exact: true })).toBeVisible();
  });

  await test.step('When I click the `Laboratory Test Results` link to launch the form', async () => {
    await page.getByText(/laboratory test results/i).click();
  });

  await test.step('Then I should see the `Laboratory Test Results` form launch in the workspace', async () => {
    await expect(page.getByText(/laboratory test results/i)).toBeVisible();
  });

  await test.step('And I maximize the form', async () => {
    await page.getByRole('button', { name: /maximize/i }).click();
  });

  await test.step('And I fill in values for the `White Blood Cells (WBC)`, `Platelets`, and `Neutrophils` questions', async () => {
    await page.locator('#ManualInputWhiteBloodCells').waitFor();
    await page.getByRole('spinbutton', { name: /white blood cells/i }).fill('5000');
    await page.getByRole('spinbutton', { name: /platelets/i }).fill('180000');
    await page.getByRole('spinbutton', { name: /neutrophils/i }).fill('35');
  });

  await test.step('Then I minimize the form in the workspace', async () => {
    await page.getByRole('button', { name: /minimize/i }).click();
  });

  await test.step('And then I maximize the form in the workspace', async () => {
    await page.getByRole('button', { name: /maximize/i }).click();
  });

  await test.step('And I should see the original form state retained', async () => {
    await expect(page.getByLabel(/white blood cells/i)).toHaveValue('5000');
    await expect(page.getByLabel(/platelets/i)).toHaveValue('180000');
    await expect(page.getByLabel(/neutrophils/i)).toHaveValue('35');
  });

  await test.step('When I click on the `Save` button', async () => {
    await page.getByRole('button', { name: /save/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/form submitted successfully/i)).toBeVisible();
  });
});
