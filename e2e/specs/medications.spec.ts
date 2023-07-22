import { test } from '../core';
import { MedicationsPage } from '../pages';
import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, Patient, startVisit, endVisit} from '../commands';
import { Visit } from '@openmrs/esm-framework';

let patient: Patient;
let visit: Visit;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
});

test('Should add, modify, discontinue and reorder medication', async ({ page,api }) => {
    const medicationPage = new MedicationsPage(page);

    await test.step('When I visit the patient medication page', async () => {
        await medicationPage.goto(patient.uuid);
    });

    await test.step('And I click on the "Record active medications" button', async () => {
        await medicationPage.page.getByText('Record active medications').click();
    });

    await test.step('And I search for "Aspirin"', async () => {
        await medicationPage.page.getByPlaceholder('Search for a drug or orderset (e.g. "Aspirin")').click();
        await medicationPage.page.getByPlaceholder('Search for a drug or orderset (e.g. "Aspirin")').fill('Aspirin');
    });

    await test.step('And I select "Aspirin 162.5mg — 162.5mg — tablet" from the list', async () => {
        await medicationPage.page.getByRole('listitem').filter({ hasText: 'Aspirin 162.5mg — 162.5mg — tabletImmediately add to basket' }).click();
    });

    await test.step('And I fill and save the form', async () => {
        await medicationPage.page.getByPlaceholder('Dose').click();
        await medicationPage.page.getByPlaceholder('Dose').fill('1');
        await medicationPage.page.getByPlaceholder('Route').click();
        await medicationPage.page.getByText('Oral').click();
        await medicationPage.page.getByPlaceholder('Frequency').click();
        await medicationPage.page.getByText('Once daily').click();
        await medicationPage.page.getByPlaceholder('Additional dosing instructions (e.g. "Take after eating")').fill('Test comment');
        await medicationPage.page.getByPlaceholder('mm/dd/yyyy').fill('07/10/2023');
        await medicationPage.page.getByPlaceholder('mm/dd/yyyy').press('Tab');
        await medicationPage.page.getByLabel('Duration', { exact: true }).fill('30');
        await medicationPage.page.getByLabel('Quantity to dispense').fill('30');
        await medicationPage.page.getByLabel('Prescription refills').fill('3');
        await medicationPage.page.getByPlaceholder('e.g. "Hypertension"').fill('Mental status change');
        await medicationPage.page.getByRole('button', { name: 'Save order' }).click();
        await medicationPage.page.getByRole('button', { name: 'Sign and close' }).click();
        await expect(medicationPage.page.getByText('placed')).toBeVisible();
    });

    await test.step('Then I should see the medication in the active medication table', async () => {
        await expect(medicationPage.activeMedicationTable().getByText('Aspirin 162.5mg')).toBeVisible();
        await expect(medicationPage.activeMedicationTable().getByText('DOSE 1 tablet — oral — once daily')).toBeVisible();
        await expect(medicationPage.activeMedicationTable().getByText(' for 30 days — REFILLS 3')).toBeVisible();
        await expect(medicationPage.activeMedicationTable().getByText('Mental status change')).toBeVisible();
        await expect(medicationPage.activeMedicationTable().getByText('test comment')).toBeVisible();
        await expect(medicationPage.activeMedicationTable().getByText('QUANTITY 30 Tablet')).toBeVisible();
    });

    await test.step('Then I modify the medication', async () => {
        await medicationPage.activeMedicationTable().getByRole('button', { name: 'Actions menu' }).click();
        await medicationPage.page.getByRole('menuitem', { name: 'Modify' }).click();
        await medicationPage.page.getByRole('listitem').filter({ hasText: 'ModifyAspirin 162.5mg — 162.5mg — TabletDOSE 1 Tablet — Oral — Once daily — REFI' }).click();
        await medicationPage.page.getByPlaceholder('Dose').fill('2');
        await medicationPage.page.getByPlaceholder('Frequency').click();
        await medicationPage.page.getByText('Twice daily').click();
        await medicationPage.page.getByLabel('Quantity to dispense').fill('60');
        await medicationPage.page.getByLabel('Prescription refills').fill('6');
        await medicationPage.page.getByRole('button', { name: 'Save order' }).click();
        await medicationPage.page.getByRole('button', { name: 'Sign and close' }).click();
        await expect(medicationPage.page.getByText('placed')).toBeVisible();
    });

    await test.step('Then I should see the modified medication in the active medication table', async () => {
        await expect(medicationPage.activeMedicationTable().getByText('Aspirin 162.5mg')).toBeVisible();
        await expect(medicationPage.activeMedicationTable().getByText('DOSE 2 tablet — oral — Twice daily')).toBeVisible();
        await expect(medicationPage.activeMedicationTable().getByText(' for 30 days — REFILLS 6')).toBeVisible();
        await expect(medicationPage.activeMedicationTable().getByText('QUANTITY 60 Tablet')).toBeVisible();
    });

    await test.step('Then I discontinue the medication', async () => {
        await medicationPage.activeMedicationTable().getByRole('button', { name: 'Actions menu' }).click();
        await medicationPage.page.getByRole('menuitem', { name: 'Discontinue' }).click();
        await medicationPage.page.getByRole('button', { name: 'Sign and close' }).click();
        await expect(medicationPage.page.getByText('placed')).toBeVisible();
    });

    await test.step('Then I should see the discontinued medication in the past medication table', async () => {
        await expect(medicationPage.pastMedicationTable().getByText('Aspirin 162.5mg')).toBeVisible();
        await expect(medicationPage.pastMedicationTable().getByText('DOSE 2 tablet — oral — Twice daily')).toBeVisible();
        await expect(medicationPage.pastMedicationTable().getByText(' for 30 days — REFILLS 6')).toBeVisible();
        await expect(medicationPage.pastMedicationTable().getByText('QUANTITY 60 Tablet')).toBeVisible();
    });

    await test.step('Then I reorder the medication', async () => {
        await medicationPage.pastMedicationTable().getByRole('button', { name: 'Actions menu' }).click();
        await medicationPage.page.getByRole('menuitem', { name: 'Reorder' }).click();
        await medicationPage.page.getByRole('button', { name: 'Sign and close' }).click();
        await expect(medicationPage.page.getByText('placed')).toBeVisible();
    });

    await test.step('Then I should see the reordered medication in the active medication table', async () => {
        await expect(medicationPage.activeMedicationTable().getByText('Aspirin 162.5mg')).toBeVisible();
        await expect(medicationPage.activeMedicationTable().getByText('DOSE 2 tablet — oral — Twice daily')).toBeVisible();
        await expect(medicationPage.activeMedicationTable().getByText(' for 30 days — REFILLS 6')).toBeVisible();
        await expect(medicationPage.activeMedicationTable().getByText('QUANTITY 60 Tablet')).toBeVisible();
    });
});

test.afterEach(async ({ api }) => {
    await endVisit(api, patient.uuid);
    await deletePatient(api, patient.uuid);
  });