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
  await test.step('When I click on appointment tab', async () => {
    await appointmentsPage.goto(patient.uuid);
  });
  //test to add appointment
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
  // test for editing the appointment
  await test.step('And I choose the "Edit" option from the popup menu', async () => {
    await page.getByRole('button', { name: 'Options' }).click();
    await page.getByRole('menuitem', { name: 'Edit' }).click();
  });

  await test.step('When I change to “Inpatient ward” location', async () => {
    await page.locator('#location').selectOption('ba685651-ed3b-4e63-9b35-78893060758a');
  });

  await test.step('And I change to “General Medicine” Service', async () => {
    await page.locator('#service').selectOption('General Medicine service');
  });

  await test.step('And I change appointment as “WalkIn”', async () => {
    await page.locator('#appointmentType').selectOption('WalkIn');
  });

  await test.step('And I change the date to Today', async () => {
    await page.locator('#datePickerInput').fill('17/02/2024');
  });

  await test.step('And I set the “Duration” of the appointment”', async () => {
    await page.locator('#duration').fill('80');
  });

  await test.step('And I change the note', async () => {
    await page.getByPlaceholder(/Write any additional points here/i).fill('Editing Appointmentments notes');
  });

  await test.step('And I click Save button', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success message', async () => {
    await expect(page.getByText(/Appointment edited/i)).toBeVisible();
  });

  //test to cancel the appointment
  await test.step('When I click on “Cancel” button ', async () => {
    await page.getByRole('button', { name: 'Options' }).click();
    await page.getByRole('menuitem', { name: 'Cancel' }).click();
  });

  await test.step('And I cancel the appointmen', async () => {
    await page.getByRole('button', { name: 'danger Cancel appointment' }).click();
  });

  await test.step('Then I should see a success message', async () => {
    await expect(page.getByText(/Appointment cancelled/i)).toBeVisible();
  });
});
