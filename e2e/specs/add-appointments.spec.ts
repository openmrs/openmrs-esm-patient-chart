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

  await test.step('And I click on the “Add” button', async () => {
    await page.click('button:has-text("Add")');
  });

  //having trouble with how to test the Schedule appointment workspace
});
