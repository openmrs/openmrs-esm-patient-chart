import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import { test } from '../core';
import { generateRandomPatient, deletePatient, type Patient, startVisit, endVisit } from '../commands';
import { ChartPage, VisitsPage } from '../pages';

let patient: Patient;
let visit: Visit;

const subjectiveFindings = `I've had a headache for the last two days`;
const objectiveFindings = `General appearance is healthy. No signs of distress. Head exam shows no abnormalities, no tenderness on palpation. Neurological exam is normal; cranial nerves intact, normal gait and coordination.`;
const assessment = `Diagnosis: Tension-type headache. Differential Diagnoses: Migraine, sinusitis, refractive error.`;
const plan = `Advise use of over-the-counter ibuprofen as needed for headache pain. Educate about proper posture during reading and screen time; discuss healthy sleep hygiene. Schedule a follow-up appointment in 2 weeks or sooner if the headache becomes more frequent or severe.`;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
});

test('Fill a clinical form', async ({ page }) => {
  const chartPage = new ChartPage(page);
  const visitsPage = new VisitsPage(page);

  await test.step('When I visit the chart summary page', async () => {
    await chartPage.goTo(patient.uuid);
  });

  await test.step('And I click the `Clinical forms` button on the siderail', async () => {
    await chartPage.page.getByLabel(/clinical forms/i, { exact: true }).click();
  });

  await test.step('Then I should see the clinical forms workspace', async () => {
    const headerRow = chartPage.formsTable().locator('thead > tr');

    await expect(chartPage.page.getByPlaceholder(/search this list/i)).toBeVisible();
    await expect(headerRow).toContainText(/form name \(a-z\)/i);
    await expect(headerRow).toContainText(/last completed/i);

    await expect(chartPage.page.getByRole('cell', { name: /covid 19/i })).toBeVisible();
    await expect(chartPage.page.getByRole('cell', { name: /laboratory test results/i })).toBeVisible();
    await expect(chartPage.page.getByRole('cell', { name: /soap note template/i })).toBeVisible();
    await expect(chartPage.page.getByRole('cell', { name: /surgical operation/i })).toBeVisible();
  });

  await test.step('When I click the `Soap note template` link to launch the form', async () => {
    await chartPage.page.getByText(/soap note template/i).click();
  });

  await test.step('Then I should see the `Soap note template` form launch in the workspace', async () => {
    await expect(chartPage.page.getByText(/soap note template/i)).toBeVisible();
  });

  await test.step('When I fill the `Subjective findings` question', async () => {
    await chartPage.page.locator('#SOAPSubjectiveFindingsid').fill(subjectiveFindings);
  });

  await test.step('And I fill the `Objective findings` question', async () => {
    await chartPage.page.locator('#SOAPObjectiveFindingsid').fill(objectiveFindings);
  });

  await test.step('And I fill the `Assessment` question', async () => {
    await chartPage.page.locator('#SOAPAssessmentid').fill(assessment);
  });

  await test.step('And I fill the `Plan` question', async () => {
    await chartPage.page.locator('#SOAPPlanid').fill(plan);
  });

  await test.step('And I click on the `Save and close` button', async () => {
    await chartPage.page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(chartPage.page.getByText(/the form has been submitted successfully/i)).toBeVisible();
  });

  await test.step('And if I navigate to the visits dashboard', async () => {
    await visitsPage.goTo(patient.uuid);
  });

  await test.step('Then I should see the newly filled form in the encounters table', async () => {
    await expect(visitsPage.page.getByRole('tab', { name: /visit summaries/i })).toBeVisible();
    await expect(visitsPage.page.getByRole('tab', { name: /all encounters/i })).toBeVisible();

    await visitsPage.page.getByRole('tab', { name: /^encounters$/i }).click();

    const headerRow = visitsPage.page.getByRole('table').locator('thead > tr');

    await expect(headerRow).toContainText(/date & time/i);
    await expect(headerRow).toContainText(/encounter type/i);
    await expect(headerRow).toContainText(/provider/i);

    await visitsPage.page.getByRole('table').locator('th#expand').click();

    await expect(visitsPage.page.getByText(subjectiveFindings)).toBeVisible();
    await expect(visitsPage.page.getByText(objectiveFindings)).toBeVisible();
    await expect(visitsPage.page.getByText(assessment)).toBeVisible();
    await expect(visitsPage.page.getByText(plan)).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit.uuid);
  await deletePatient(api, patient.uuid);
});
