import { test } from '../core';
import { ProgramsPage } from '../pages';
import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, Patient } from '../commands';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('Add and edit a program enrollment', async ({ page, api }) => {
  const programsPage = new ProgramsPage(page);
  const row = programsPage.programsTable().locator('tr');
  const programCell = row.locator('td:first-child');
  const locationCell = row.locator('td:nth-child(2)');
  const enrollmentDateCell = row.locator('td:nth-child(3)');
  const completionDateCell = row.locator('td:nth-child(4)');

  await test.step('When I visit the Programs page', async () => {
    await programsPage.goTo(patient.uuid);
  });

  await test.step('And I click on the `Record program enrollment` link', async () => {
    await programsPage.page.getByText(/record program enrollment/i).click();
  });

  await test.step('And I record a program enrollment', async () => {
    await programsPage.page.locator('#program').selectOption('64f950e6-1b07-4ac0-8e7e-f3e148f3463f');
    await programsPage.page.locator('#enrollmentDateInput').fill('04/07/2023');
    await programsPage.page.locator('#completionDateInput').fill('05/07/2023');
    await programsPage.page.locator('#completionDateInput').press('Tab');
    await programsPage.page.locator('#location').selectOption('44c3efb0-2583-4c80-a79e-1f756a03c0a1');
  });

  await test.step('And I click the submit button', async () => {
    await programsPage.page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('And I should see a success toast notification', async () => {
    await expect(programsPage.page.getByText(/program enrollment saved/i)).toBeVisible();
  });

  await test.step('Then I should see newly recorded program enrollment in the list', async () => {
    await expect(programCell).toHaveText(/hiv care and treatment/i);
    await expect(enrollmentDateCell.getByText(/04-Jul-2023/i)).toBeVisible();
    await expect(completionDateCell.getByText(/completed on 05-Jul-2023/i)).toBeVisible();
    await expect(locationCell).toHaveText(/Outpatient Clinic/);
  });

  await test.step('When I click the `Edit` button', async () => {
    await programsPage.editButton().click();
  });

  await test.step('And I edit the program enrollment', async () => {
    await programsPage.page.locator('#enrollmentDateInput').fill('03/07/2023');
    await programsPage.page.locator('#completionDateInput').fill('04/07/2023');
    await programsPage.page.locator('#completionDateInput').press('Tab');
    await programsPage.page.locator('#location').selectOption('1ce1b7d4-c865-4178-82b0-5932e51503d6');
  });

  await test.step('And I click the submit button', async () => {
    await programsPage.page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('And I should see a success toast notification', async () => {
    await expect(programsPage.page.getByText(/program enrollment updated/i)).toBeVisible();
  });

  await test.step('Then I should see the updated program enrollment in the list', async () => {
    await expect(programCell).toHaveText(/hiv care and treatment/i);
    await expect(enrollmentDateCell.getByText(/03-Jul-2023/i)).toBeVisible();
    await expect(completionDateCell.getByText(/04-Jul-2023/i)).toBeVisible();
    await expect(locationCell).toHaveText(/community outreach/i);
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
