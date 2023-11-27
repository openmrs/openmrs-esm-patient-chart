import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import { test } from '../core';
import { generateRandomPatient, deletePatient, type Patient, startVisit, endVisit } from '../commands';
import { ChartPage } from '../pages';

let patient: Patient;
let visit: Visit;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
});

test('Fill a clinical form', async ({ page, api }) => {
  const chartPage = new ChartPage(page);

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

    await expect(chartPage.page.getByRole('cell', { name: /ampath_poc_adult_return_visit_form/i })).toBeVisible();
    await expect(chartPage.page.getByRole('cell', { name: /covid 19/i })).toBeVisible();
    await expect(chartPage.page.getByRole('cell', { name: /laboratory test orders/i })).toBeVisible();
    await expect(chartPage.page.getByRole('cell', { name: /laboratory test results/i })).toBeVisible();
    await expect(chartPage.page.getByRole('cell', { name: /soap note template/i })).toBeVisible();
    await expect(chartPage.page.getByRole('cell', { name: /surgical operation/i })).toBeVisible();
  });

  await test.step('And if I fill a form', async () => {
    await chartPage.page.getByText(/soap note template/i).click();

    await expect(chartPage.page.getByRole('button', { name: /save and close/i })).toBeVisible();
    await expect(chartPage.page.getByRole('button', { name: /discard/i })).toBeVisible();

    await chartPage.page.locator('#SOAPSubjectiveFindingsid').fill("I've had a headache for the last two days");

    await chartPage.page
      .locator('#SOAPObjectiveFindingsid')
      .fill(
        'General appearance is healthy. No signs of distress. Head exam shows no abnormalities, no tenderness on palpation. Neurological exam is normal; cranial nerves intact, normal gait and coordination.',
      );

    await chartPage.page
      .locator('#SOAPAssessmentid')
      .fill('Diagnosis: Tension-type headache. Differential Diagnoses: Migraine, sinusitis, refractive error.');

    await chartPage.page
      .locator('#SOAPPlanid')
      .fill(
        'Advise use of over-the-counter ibuprofen as needed for headache pain. Educate about proper posture during reading and screen time; discuss healthy sleep hygiene. Schedule a follow-up appointment in 2 weeks or sooner if the headache becomes more frequent or severe.',
      );
  });

  await test.step('And I click the submit button', async () => {
    await chartPage.page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(chartPage.page.getByText(/the form has been submitted successfully/i)).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit.uuid);
  await deletePatient(api, patient.uuid);
});
