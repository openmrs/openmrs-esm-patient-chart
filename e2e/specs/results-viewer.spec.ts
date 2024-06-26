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
  const form = page.locator('[data-extension-slot-name="form-widget-slot"]');

  const completeBloodCountData = [
    {
      label: 'White Blood Cells (WBC) (10^3/uL)',
      resultsPageReference: 'White Blood Cells',
      value: '12.5',
      updatedValue: '12.7',
    },
    {
      label: 'Red Blood Cells (RBC) (10^6/uL)',
      resultsPageReference: 'Red Blood Cells',
      value: '5.2',
      updatedValue: '5.3',
    },
    {
      label: 'Platelets (10^3/mL)',
      resultsPageReference: 'Platelets',
      value: '150',
      updatedValue: '155',
    },
    // TODO: Uncomment the rest once https://openmrs.atlassian.net/browse/O3-3478 is fixed
    // {
    //   label: 'Neutrophils (%)',
    //   resultsPageReference: 'Neutrophils',
    //   value: '60',
    //   updatedValue: '62'
    // },
    // {
    //   label: 'MCV (fL) - Mean Corpuscular Volume',
    //   resultsPageReference: 'MCV',
    //   value: '90',
    //   updatedValue: '92'
    // },
    // {
    //   label: 'MCH (pg) - Mean Corpuscular Hemoglobin',
    //   resultsPageReference: 'MCH',
    //   value: '30',
    //   updatedValue: '31'
    // },
    // {
    //   label: 'MCHC (g/dL) - Mean Cell Hemoglobin Concentration',
    //   resultsPageReference: 'MCHC',
    //   value: '33',
    //   updatedValue: '34'
    // },
    // {
    //   label: 'Lymphocytes (%) - microscopic exam',
    //   resultsPageReference: 'Lymphocytes',
    //   value: '30',
    //   updatedValue: '32'
    // },
    // {
    //   label: 'Hematocrit (%)',
    //   resultsPageReference: 'Hematocrit',
    //   value: '45',
    //   updatedValue: '47'
    // },
    // {
    //   label: 'Haemoglobin (g/dL)',
    //   resultsPageReference: 'Haemoglobin',
    //   value: '15',
    //   updatedValue: '16'
    // },
    // {
    //   label: 'Combined % of monocytes, eosinophils and basophils (%)',
    //   resultsPageReference: 'Combined % of monocytes, eosinophils and basophils',
    //   value: '5',
    //   updatedValue: '6'
    // }
  ];

  const chemistryResultsData = [
    {
      label: 'Alkaline Phosphatase (U/L)',
      resultsPageReference: 'Alkaline Phosphatase',
      value: '70',
      updatedValue: '72',
    },
    {
      label: 'Amylase (IU/L)',
      resultsPageReference: 'Amylase',
      value: '120',
      updatedValue: '122',
    },
    {
      label: 'BUN (mmol/L) - Blood Urea Nitrogen',
      resultsPageReference: 'Blood Urea Nitrogen',
      value: '5.5',
      updatedValue: '5.7',
    },
    // TODO: Uncomment the rest once https://openmrs.atlassian.net/browse/O3-3478 is fixed
    // {
    //   label: 'Fasting Blood Glucose (mg/dL)',
    //   resultsPageReference: 'Fasting Blood Glucose',
    //   value: '90',
    //   updatedValue: '92'
    // },
    // {
    //   label: 'Post-Prandial Blood Glucose (mg/dL)',
    //   resultsPageReference: 'Post-Prandial Blood Glucose',
    //   value: '140',
    //   updatedValue: '142'
    // },
    // {
    //   label: 'Serum Albumin (g/dL)',
    //   resultsPageReference: 'Serum Albumin',
    //   value: '4.0',
    //   updatedValue: '4.2'
    // },
    // {
    //   label: 'Serum Calcium (mg/dL)',
    //   resultsPageReference: 'Serum Calcium',
    //   value: '9.0',
    //   updatedValue: '9.2'
    // },
    // {
    //   label: 'Serum Potassium (mmol/L)',
    //   resultsPageReference: 'Serum Potassium',
    //   value: '4.2',
    //   updatedValue: '4.4'
    // },
    // {
    //   label: 'Serum Sodium (mmol/L)',
    //   resultsPageReference: 'Serum Sodium',
    //   value: '140',
    //   updatedValue: '142'
    // },
    // {
    //   label: 'Serum Creatinine (umol/L)',
    //   resultsPageReference: 'Serum Creatinine',
    //   value: '70',
    //   updatedValue: '72'
    // },
    // {
    //   label: 'Total Protein (g/dL)',
    //   resultsPageReference: 'Total Protein',
    //   value: '7.0',
    //   updatedValue: '7.2'
    // },
    // {
    //   label: 'Serum Glucose (mg/dl)',
    //   resultsPageReference: 'Serum Glucose',
    //   value: '90',
    //   updatedValue: '92'
    // },
    // {
    //   label: 'Serum Glucose (mmol)',
    //   resultsPageReference: 'Serum Glucose',
    //   value: '5.0',
    //   updatedValue: '5.2'
    // },
    // {
    //   label: 'Total Bilirubin (umol/L)',
    //   resultsPageReference: 'Total Bilirubin',
    //   value: '10',
    //   updatedValue: '12'
    // },
    // {
    //   label: 'Serum Glutamic-Oxaloacetic Transaminase (IU/L) aka SGPT, AST',
    //   resultsPageReference: 'Serum Glutamic-Oxaloacetic Transaminase',
    //   value: '30',
    //   updatedValue: '32'
    // },
    // {
    //   label: 'Alkaline Phosphatase, ALP (U/L)',
    //   resultsPageReference: 'Alkaline Phosphatase, ALP',
    //   value: '70',
    //   updatedValue: '72'
    // },
    // {
    //   label: 'Serum Uric Acid (mg/dL)',
    //   resultsPageReference: 'Serum Uric Acid',
    //   value: '4.5',
    //   updatedValue: '4.7'
    // },
    // {
    //   label: 'Total Cholesterol (mmol/L)',
    //   resultsPageReference: 'Total Cholesterol',
    //   value: '5.0',
    //   updatedValue: '5.2'
    // },
    // {
    //   label: 'Triglycerides (mmol/L)',
    //   resultsPageReference: 'Triglycerides',
    //   value: '1.5',
    //   updatedValue: '1.7'
    // },
    // {
    //   label: 'Serum Carbon Dioxide CO2 (mmol/L)',
    //   resultsPageReference: 'Serum Carbon Dioxide CO2',
    //   value: '25',
    //   updatedValue: '27'
    // }
  ];

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

  await test.step('And I fill the "Complete Blood Count" section', async () => {
    for (const { label, value } of completeBloodCountData) {
      await test.step(label, async () => {
        await form.getByLabel(label, { exact: true }).fill(value);
      });
    }
  });

  await test.step('And I fill the "Chemistry Results" section', async () => {
    for (const { label, value } of chemistryResultsData) {
      await test.step(label, async () => {
        await form.getByLabel(label, { exact: true }).fill(value);
      });
    }
  });

  await test.step('(SKIPPED) And I fill the "Urine" and "Stool" sections', async () => {
    // TODO: https://openmrs.atlassian.net/browse/O3-3487
  });

  await test.step('And I click on the `Save` button', async () => {
    await page.getByRole('button', { name: /save/i, exact: true }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/record created/i, { exact: true })).toBeVisible();
    await expect(page.getByText(/a new encounter was created/i, { exact: true })).toBeVisible();
  });

  await test.step('When I go to the results viewer page', async () => {
    await resultsViewerPage.goTo(patient.uuid);
  });

  await test.step('And I click on the `Panel` tab', async () => {
    await page.getByRole('tab', { name: /panel/i }).click();
  });

  await test.step('Then I should see the newly entered test results reflect in the results viewer', async () => {
    for (const { resultsPageReference, value } of completeBloodCountData) {
      await test.step(resultsPageReference, async () => {
        const row = page.locator(`tr:has-text("${resultsPageReference}")`);
        await expect(row).toContainText(value);
      });
    }
    for (const { resultsPageReference, value } of chemistryResultsData) {
      await test.step(resultsPageReference, async () => {
        const row = page.locator(`tr:has-text("${resultsPageReference}")`);
        await expect(row).toContainText(value);
      });
    }
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

  await test.step('And I edit values in the Complete Blood Count Section', async () => {
    for (const { label, updatedValue } of completeBloodCountData) {
      await test.step(label, async () => {
        await form.getByLabel(label, { exact: true }).fill(updatedValue);
      });
    }
  });

  await test.step('And I edit values in the Chemistry Results Data Section', async () => {
    for (const { label, updatedValue } of chemistryResultsData) {
      await test.step(label, async () => {
        await form.getByLabel(label, { exact: true }).fill(updatedValue);
      });
    }
  });

  await test.step('And I save the form', async () => {
    await page.getByRole('button', { name: /save/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/record updated/i, { exact: true })).toBeVisible();
    await expect(page.getByText(/the patient encounter was updated/i, { exact: true })).toBeVisible();
  });

  await test.step('When I revisit the `Results Viewer` page', async () => {
    await resultsViewerPage.goTo(patient.uuid);
  });

  await test.step('And I click on the `Panel` tab', async () => {
    await page.getByRole('tab', { name: /panel/i }).click();
  });

  await test.step('Then I should see the updated results reflect in the results viewer', async () => {
    for (const { resultsPageReference, updatedValue } of completeBloodCountData) {
      await test.step(resultsPageReference, async () => {
        const row = page.locator(`tr:has-text("${resultsPageReference}")`);
        await expect(row).toContainText(updatedValue);
      });
    }
    for (const { resultsPageReference, updatedValue } of chemistryResultsData) {
      await test.step(resultsPageReference, async () => {
        const row = page.locator(`tr:has-text("${resultsPageReference}")`);
        await expect(row).toContainText(updatedValue);
      });
    }
  });
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit.uuid);
  await deletePatient(api, patient.uuid);
});
