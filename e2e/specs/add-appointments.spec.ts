import { test } from '../core';
import { AppointmentsPage } from '../pages';
import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, Patient } from '../commands';

let patient: Patient;

test.beforeEach(async ({ api }) => {
    patient = await generateRandomPatient(api);
});

test('Should add, delete, and edit an appointment', async ({ page, api }) => {
    const appointmentsPage = new AppointmentsPage(page);
    const row = appointmentsPage.appointmentsTable().locator('tr');

    await test.step('When I go to the appointments page', async () => {
        await appointmentsPage.goto(patient.uuid);
    });

    await test.step('And I click on the schedule appointment button', async () => {
        await appointmentsPage.page.getByText('Schedule Appointment').click();
    });

    await test.step('And I fill the appointment form', async () => {
        await appointmentsPage.page.locator('#appointment').selectOption('Outpatient Clinic')
    });

    await test.step('And I save the form', async () => {
        await appointmentsPage.page.getByRole('button', { name: 'Save and close' }).click();
    });

    await test.step('Then I should see the notification', async () => {
        await expect(appointmentsPage.page.getByText('saved')).toBeVisible();
    });

    await test.step('And I see the appointment in the list', async () => {
    });
        

    await test.step('And I click on the edit appointment button', async () => {
        await appointmentsPage.editButton().click();
    });

    await test.step('And I edit the appointment', async () => {
    });

    await test.step('And I save the form', async () => {
        await appointmentsPage.page.getByRole('button', { name: 'Save and close' }).click();
    });

    await test.step('Then I should see the notification', async () => {
    });

    await test.step('And I see the appointment in the list', async () => {
    });

    await test.step('And I click on the cancel appointment button', async () => {
        await appointmentsPage.page.getByRole('button', { name: 'cancel appointment' }).click();
    });

    await test.step('Then I should see the notification', async () => {
    });
});

test.afterEach(async ({ api }) => {
    await deletePatient(api, patient.uuid);
});