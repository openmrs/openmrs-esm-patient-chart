import { test } from '../core';
import { ProgramPage } from '../pages';
import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, Patient } from '../commands';
import { getByTestId, getByText } from '@testing-library/dom';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('Should add a program and edit program', async ({ page, api }) => {
  const programPage = new ProgramPage(page);
  const row = programPage.table().locator('tr');
  const programCell = row.locator('td:first-child');
  const locationCell = row.locator('td:nth-child(2)');
  const enrollmentDateCell = row.locator('td:nth-child(3)');
  const completionDateCell = row.locator('td:nth-child(4)');

  await test.step('When I visit the patient chart page', async () => {
    await programPage.goto(patient.uuid);
  });

  await test.step('And I click on the Record program enrollment button', async () => {
    await programPage.page.getByText('Record program enrollment').click();
  });

  await test.step('And I Fill the form', async () => {
    await programPage.page.locator('#program').selectOption('64f950e6-1b07-4ac0-8e7e-f3e148f3463f');
    await programPage.page.locator('#enrollmentDateInput').fill('04/07/2023');
    await programPage.page.locator('#completionDateInput').fill('05/07/2023');
    await programPage.page.locator('#completionDateInput').press('Tab');
    await programPage.page.locator('#location').selectOption('44c3efb0-2583-4c80-a79e-1f756a03c0a1');
  });

  await test.step('And I click on the Save button', async () => {
    await programPage.page.getByRole('button', { name: 'Save and close' }).click();
  });

  await test.step('And I should see the success message', async () => {
    await expect(programPage.page.getByText('saved')).toBeVisible();
  });

  await test.step('Then I should see the program in the patient chart', async () => {
    await expect(programCell).toHaveText('HIV Care and Treatment');
    await expect(enrollmentDateCell.getByText('04-Jul-2023')).toBeVisible();
    await expect(completionDateCell.getByText('05-Jul-2023')).toBeVisible();
    await expect(locationCell).toHaveText('Outpatient Clinic');
  });

  await test.step('When I click on the Edit button', async () => {
    await programPage.editButton().click();
  });

  await test.step('And I edit the form', async () => {
    await programPage.page.locator('#enrollmentDateInput').fill('03/07/2023');
    await programPage.page.locator('#completionDateInput').fill('04/07/2023');
    await programPage.page.locator('#completionDateInput').press('Tab');
    await programPage.page.locator('#location').selectOption('1ce1b7d4-c865-4178-82b0-5932e51503d6');
  });

  await test.step('And I click on the Save button', async () => {
    await programPage.page.getByRole('button', { name: 'Save and close' }).click();
  });

  await test.step('And I should see the success message', async () => {
    await expect(programPage.page.getByText('updated')).toBeVisible();
  });

  await test.step('Then I should see the updated program in the patient chart', async () => {
    await expect(programCell).toHaveText('HIV Care and Treatment');
    await expect(enrollmentDateCell.getByText('03-Jul-2023')).toBeVisible();
    await expect(completionDateCell.getByText('04-Jul-2023')).toBeVisible();
    await expect(locationCell).toHaveText('Community Outreach');
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
