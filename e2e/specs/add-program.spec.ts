import { test } from '../core';
import { ProgramPage } from '../pages';
import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, Patient } from '../commands';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});
test('Add program to patient', async ({ page, api }) => {
  const programPage = new ProgramPage(page);

  await test.step('When I visit the patient chart page', async () => {
    await programPage.goto(patient.uuid);
  });

  await test.step('And I click on the Record program enrollment button', async () => {
    await programPage.page.getByText('Record program enrollment').click();
  });

  await test.step('And I select the PMTCT option', async () => {
    await page.locator('#program').selectOption('d1b6cd43-8ac7-4cdd-8fb4-fe51635c82b4');
  });

  await test.step('Then I add completion date', async () => {
    await programPage.page.locator('#completionDateInput').fill('28/03/2023');
  });

  await test.step('And I click on the Save button', async () => {
    await programPage.page.getByText('Save').click();
  });

  await test.step('Then I should see the program in the patient chart', async () => {
    await expect(programPage.tableRow().getByText('PMTCT')).toBeVisible();
  });
});
test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
