import { test } from '../core';
import { expect } from '@playwright/test';
import { NotesPage } from '../pages';
import { deletePatient, generateRandomPatient, Patient, startVisit, endVisit} from '../commands';
import { Visit } from '@openmrs/esm-framework';

let patient: Patient;
let visit: Visit;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
});

test('should be able to add a note to a patient', async ({ page, api }) => {
  const notesPage = new NotesPage(page);

  await test.step('When I visit the notes page', async () => {
    await notesPage.goto(patient.uuid);
  });

  await test.step('And I click Record visit notes', async () => {
    await notesPage.page.getByText('Record visit notes').click();
  });

  await test.step('And I fill a note', async () => {
    await notesPage.page.getByLabel('Visit date').fill('03/07/2023');
    await notesPage.page.getByLabel('Enter Primary diagnoses').fill('Aspirin');
    await notesPage.page.getByText('Aspirin').click();
    await notesPage.page.getByLabel('Enter Secondary diagnoses').fill('Asthma');
    await notesPage.page.getByText('Asthma').click();
    await notesPage.page.getByLabel('Write your notes').fill('Test note');
  });

  await test.step('And I click on the submit button', async () => {
    await notesPage.page.getByText('Save').click();
  });

  await test.step('Then I should see the note in the table', async () => {
    await expect(notesPage.table()).toHaveText('Asthma');
    await expect(notesPage.table()).toHaveText('Aspirin');
  });
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit.uuid);
  await deletePatient(api, patient.uuid);
});
