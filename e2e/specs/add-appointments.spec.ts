import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, type Patient } from '../commands';
import { test } from '../core';
import { AppointmentsPage } from '../pages';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('Add appointment for a patient, edit the added appointment and cancel it', async ({ page, api }) => {
  const appointmentsPage = new AppointmentsPage(page);
  const row = appointmentsPage.appointmentsTable().locator('tr');
  await test.step('When I click on appointment tab', async () => {
    await appointmentsPage.goto(patient.uuid);
  });

  await test.step('And I click on the “Add” button', async () => {
    await page.click('button:has-text("Add")');
  });

  await test.step('When I select Mobile Clinic location', async () => {
    await page.locator('#location').selectOption('8d9045ad-50f0-45b8-93c8-3ed4bce19dbf');
  });

  await test.step('And I select “Outpatient Department” service', async () => {
    await page.locator('#service').selectOption('Outpatient Department');
  });

  await test.step('And I make appointment as “Scheduled”', async () => {
    await page.locator('#appointmentType').selectOption('Scheduled');
  });

  await test.step('And I set date for tomorrow', async () => {
    await page.locator('#datePickerInput').fill('18/02/2024');
  });

  await test.step('And I set the “Duration”', async () => {
    await page.locator('#duration').fill('60');
  });

  await test.step('And I add a note', async () => {
    await page.getByPlaceholder(/Write any additional points here/i).fill('Testing Appointments notes');
  });

  await test.step('And I click Save button', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success message', async () => {
    await expect(page.getByText(/Appointment scheduled/i)).toBeVisible();
  });

  await test.step('And the created appointment should be displayed in the upcoming appointments table', async () => {
    await expect(row).toContainText('Mobile Clinic');
    await expect(row).toContainText('Outpatient Department');
    await expect(row).toContainText('Scheduled');
    await expect(row).toContainText('14-Feb-2024');
    await expect(row).toContainText('60');
  });
});
