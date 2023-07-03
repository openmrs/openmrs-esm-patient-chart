import { test } from '../core';
import { expect } from '@playwright/test';
import { NotesPage } from '../pages';
import { deletePatient, generateRandomPatient, Patient } from '../commands';

let patient: Patient;
test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('should be able to add a note to a patient', async ({ page, api }) => {
  const notesPage = new NotesPage(page);

  await test.step('When I visit the notes page', async () => {
    await notesPage.goto(patient.uuid);
  });

  await test.step('Then I start visit', async () => {
    await notesPage.startVisit();
    await expect(notesPage.page.getByText('Active Visit')).toBeVisible();
  });

  await test.step('And I click Record visit notes', async () => {
    await notesPage.page.getByText('Record visit notes').click();
  });

  await test.step('And I fill a note', async () => {
    await notesPage.page.locator('#visitDateTimePicker').fill('03/07/2023');
    await notesPage.page.locator('diagnosisPrimarySearch').fill('Aspirin');
    await notesPage.page.getByText('Aspirin').click();
    await notesPage.page.locator('#diagnosisSecondarySearch').fill('Asthma');
    await notesPage.page.getByText('Asthma').click();
    await notesPage.page.locator('#additionalNote').fill('Test note');
  });

  await test.step('And I click on the submit button', async () => {
    await notesPage.page.getByText('Save').click();
  });

  await test.step('Then I should see the note in the table', async () => {
    await expect(notesPage.page.locator('tr')).toHaveText('Asthma');
    await expect(notesPage.page.locator('tr')).toHaveText('Aspirin');
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
