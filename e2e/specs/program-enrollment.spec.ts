import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, type Patient } from '../commands';
import { test } from '../core';
import { ProgramsPage } from '../pages';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('Add and edit a program enrollment', async ({ page }) => {
  const programsPage = new ProgramsPage(page);
  const headerRow = programsPage.programsTable().locator('thead > tr');
  const dataRow = programsPage.programsTable().locator('tbody > tr');

  await test.step('When I visit the Programs page', async () => {
    await programsPage.goTo(patient.uuid);
  });

  await test.step('And I click on the `Record program enrollment` link', async () => {
    await page.getByText(/record program enrollment/i).click();
  });

  await test.step('Then I should see the `Record program enrollment` form launch in the workspace', async () => {
    await expect(page.getByText('Record program enrollment', { exact: true })).toBeVisible();
  });

  await test.step('When I select the program named `HIV Care and Treatment`', async () => {
    await page.locator('#program').selectOption('64f950e6-1b07-4ac0-8e7e-f3e148f3463f');
  });

  await test.step('And I set `04/07/2023` as the enrollment date', async () => {
    await page.locator('#enrollmentDateInput').fill('04/07/2023');
  });

  await test.step('And I set `05/07/2023` as the completion date', async () => {
    await page.locator('#completionDateInput').fill('05/07/2023');
    await page.locator('#completionDateInput').press('Tab');
  });

  await test.step('And I select `Outpatient Clinic` as the enrollment location', async () => {
    await page.locator('#location').selectOption('44c3efb0-2583-4c80-a79e-1f756a03c0a1');
  });

  await test.step('And I click on the `Save and close` button', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/program enrollment saved/i)).toBeVisible();
  });

  await test.step('And I should see newly recorded program enrollment in the list', async () => {
    await expect(headerRow).toContainText(/active programs/i);
    await expect(headerRow).toContainText(/location/i);
    await expect(headerRow).toContainText(/date enrolled/i);
    await expect(headerRow).toContainText(/status/i);
    await expect(dataRow).toContainText(/hiv care and treatment/i);
    await expect(dataRow).toContainText(/04-Jul-2023/i);
    await expect(dataRow).toContainText(/completed on 05-Jul-2023/i);
    await expect(dataRow).toContainText(/outpatient clinic/i);
  });

  await test.step('When I click on the `Edit` button of the created program', async () => {
    await programsPage.overflowButton().click();
    await programsPage.editProgramButton().click();
  });

  await test.step('Then I should see the program launch in the workspace in edit mode`', async () => {
    await expect(page.getByRole('cell', { name: /hiv care and treatment/i })).toBeVisible();
  });

  await test.step('When I change the enrollment date to `03/07/2023`', async () => {
    await page.locator('#enrollmentDateInput').clear();
    await page.locator('#enrollmentDateInput').fill('03/07/2023');
  });

  await test.step('And I change the completion date to `04/07/2023`', async () => {
    await page.locator('#completionDateInput').clear();
    await page.locator('#completionDateInput').fill('04/07/2023');
    await page.locator('#completionDateInput').press('Tab');
  });

  await test.step('And I change the enrollment location to `Community Outreach`', async () => {
    await page.locator('#location').selectOption('1ce1b7d4-c865-4178-82b0-5932e51503d6');
  });

  await test.step('And I click on the `Save and close` button', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/program enrollment updated/i)).toBeVisible();
  });

  await test.step('And I should see the updated program enrollment in the list', async () => {
    await expect(dataRow).toContainText(/hiv care and treatment/i);
    await expect(dataRow).toContainText(/03-Jul-2023/i);
    await expect(dataRow).not.toContainText(/completed on 05-Jul-2023/i);
    await expect(dataRow).toContainText(/completed on 04-Jul-2023/i);
    await expect(dataRow).not.toContainText(/outpatient clinic/i);
    await expect(dataRow).toContainText(/community outreach/i);
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
