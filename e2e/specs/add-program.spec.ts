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

  await test.step('And I Fill the form', async () => {
    await page.locator('#program').selectOption('64f950e6-1b07-4ac0-8e7e-f3e148f3463f');
    await page.locator('#enrollmentDateInput').click();
    await page.locator('#enrollmentDateInput').fill('09/07/2023');
    await page.locator('#completionDateInput').click();
    await page.locator('#completionDateInput').fill('09/07/2023');
    await programPage.page.locator('#location').selectOption('44c3efb0-2583-4c80-a79e-1f756a03c0a1');
  });

  await test.step('And I click on the Save button', async () => {
    await programPage.page.getByText('Save').click();
    await expect(programPage.page.getByText('saved')).toBeVisible();
  });

  await test.step('Then I should see the program in the patient chart', async () => {
    await expect(programPage.table().locator('tr').getByText('HIV Care and Treatment')).toBeVisible();
  });
});
test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
