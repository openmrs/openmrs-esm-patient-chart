import { expect } from '@playwright/test';
import { test } from '../core';
import { BiometricsAndVitalsPage } from '../pages';
import { type Patient, deletePatient, endVisit, generateRandomPatient, startVisit } from '../commands';
import { type Visit } from '@openmrs/esm-framework';

const createdPatients: Patient[] = [];
const createdVisits: Visit[] = [];

function calculateBirthdate(age: { years?: number; months?: number }): string {
  const date = new Date();
  if (age.years) date.setFullYear(date.getFullYear() - age.years);
  if (age.months) date.setMonth(date.getMonth() - age.months);
  return date.toISOString().split('T')[0];
}

const ageGroups = [
  {
    name: 'newborn',
    age: { months: 1 },
    normalVitals: { temp: '36.7', systolic: '80', diastolic: '60', respiration: '40' },
    criticalVitals: { temp: '37.8', systolic: '57', diastolic: '18', respiration: '18' },
  },
  {
    name: 'infant',
    age: { months: 6 },
    normalVitals: { temp: '36.7', systolic: '80', diastolic: '50', respiration: '40' },
    criticalVitals: { temp: '37.8', systolic: '65', diastolic: '37', respiration: '28' },
  },
  {
    name: 'child',
    age: { years: 8 },
    normalVitals: { temp: '36.7', systolic: '100', diastolic: '70', respiration: '18' },
    criticalVitals: { temp: '37.8', systolic: '85', diastolic: '55', respiration: '23' },
  },
  {
    name: 'adult',
    age: { years: 30 },
    normalVitals: { temp: '36.7', systolic: '115', diastolic: '70', respiration: '16' },
    criticalVitals: { temp: '37.8', systolic: '97', diastolic: '57', respiration: '11' },
  },
];

test.describe('Vitals validation for different age groups', () => {
  ageGroups.forEach((group) => {
    test(`Normal vitals validation for ${group.name} patient`, async ({ api, page }) => {
      const birthdate = calculateBirthdate(group.age);
      const patient = await generateRandomPatient(api, { birthdate });
      createdPatients.push(patient);
      const visit = await startVisit(api, patient.uuid);
      createdVisits.push(visit);

      const vitalsPage = new BiometricsAndVitalsPage(page);
      const headerRow = vitalsPage.vitalsTable().locator('thead > tr');
      const dataRow = vitalsPage.vitalsTable().locator('tbody > tr');

      await test.step(`When I visit the vitals and biometrics page for ${group.name} patient`, async () => {
        await vitalsPage.goTo(patient.uuid);
      });

      await test.step('And I click the `Record biometrics` link to launch the form', async () => {
        await vitalsPage.page.getByText(/record vital signs/i).click();
      });

      await test.step('Then I should see the `Record Vitals and Biometrics` form launch in the workspace', async () => {
        await expect(vitalsPage.page.getByText(/record vitals and biometrics/i)).toBeVisible();
      });

      await test.step(`When I enter the patient's temperature: ${group.normalVitals.temp}`, async () => {
        await vitalsPage.page.getByRole('spinbutton', { name: /temperature/i }).fill(group.normalVitals.temp);
      });

      await test.step(`And I enter the systolic blood pressure: ${group.normalVitals.systolic}`, async () => {
        await vitalsPage.page.getByRole('spinbutton', { name: /systolic/i }).fill(group.normalVitals.systolic);
      });

      await test.step(`And I enter the diastolic blood pressure: ${group.normalVitals.diastolic}`, async () => {
        await vitalsPage.page.getByRole('spinbutton', { name: /diastolic/i }).fill(group.normalVitals.diastolic);
      });

      await test.step(`And I enter the respiration rate: ${group.normalVitals.respiration}`, async () => {
        await vitalsPage.page
          .getByRole('spinbutton', { name: /respiration rate/i })
          .fill(group.normalVitals.respiration);
      });

      await test.step('And I click on the `Save and close` button to save the vitals', async () => {
        await vitalsPage.page.getByRole('button', { name: /save and close/i }).click();
      });

      await test.step('Then I should see a success notification confirming vitals were saved', async () => {
        await expect(vitalsPage.page.getByText(/vitals and biometrics saved/i)).toBeVisible();
      });

      await test.step('And I should see the vitals table headers', async () => {
        await expect(headerRow).toContainText(/temp/i);
        await expect(headerRow).toContainText(/bp/i);
        await expect(headerRow).toContainText(/r. rate/i);
      });

      await test.step(`And I should see the temperature value of ${group.normalVitals.temp} in the vitals table`, async () => {
        await expect(dataRow).toContainText(group.normalVitals.temp);
      });

      await test.step(`And I should see the blood pressure value of ${group.normalVitals.systolic}/${group.normalVitals.diastolic} in the vitals table`, async () => {
        await expect(dataRow).toContainText(`${group.normalVitals.systolic} / ${group.normalVitals.diastolic}`);
      });

      await test.step(`And I should see the respiration rate of ${group.normalVitals.respiration} in the vitals table`, async () => {
        await expect(dataRow).toContainText(group.normalVitals.respiration);
      });

      await test.step('And the temperature cell should have normal styling', async () => {
        const normalCell = vitalsPage.page.getByRole('cell', { name: group.normalVitals.temp });
        const backgroundColor = await normalCell.evaluate((el) => window.getComputedStyle(el).backgroundColor);
        expect(backgroundColor).toBe('rgb(255, 255, 255)');

        const afterContent = await normalCell.evaluate((el) => {
          const after = window.getComputedStyle(el, '::after');
          return after.content;
        });
        expect(afterContent).toBe('none');
      });
    });

    test(`Critical range vitals validation flagging for ${group.name} patient`, async ({ api, page }) => {
      const birthdate = calculateBirthdate(group.age);
      const patient = await generateRandomPatient(api, { birthdate });
      createdPatients.push(patient);
      const visit = await startVisit(api, patient.uuid);
      createdVisits.push(visit);

      const vitalsPage = new BiometricsAndVitalsPage(page);
      const headerRow = vitalsPage.vitalsTable().locator('thead > tr');
      const dataRow = vitalsPage.vitalsTable().locator('tbody > tr');

      await test.step(`When I visit the vitals and biometrics page for ${group.name} patient`, async () => {
        await vitalsPage.goTo(patient.uuid);
      });

      await test.step('And I click the `Record biometrics` link to launch the form', async () => {
        await vitalsPage.page.getByText(/record vital signs/i).click();
      });

      await test.step('Then I should see the `Record Vitals and Biometrics` form launch in the workspace', async () => {
        await expect(vitalsPage.page.getByText(/record vitals and biometrics/i)).toBeVisible();
      });

      await test.step(`When I enter the patient's temperature: ${group.criticalVitals.temp}`, async () => {
        await vitalsPage.page.getByRole('spinbutton', { name: /temperature/i }).fill(group.criticalVitals.temp);
      });

      await test.step(`And I enter the systolic blood pressure: ${group.criticalVitals.systolic}`, async () => {
        await vitalsPage.page.getByRole('spinbutton', { name: /systolic/i }).fill(group.criticalVitals.systolic);
      });

      await test.step(`And I enter the diastolic blood pressure: ${group.criticalVitals.diastolic}`, async () => {
        await vitalsPage.page.getByRole('spinbutton', { name: /diastolic/i }).fill(group.criticalVitals.diastolic);
      });

      await test.step(`And I enter the respiration rate: ${group.criticalVitals.respiration}`, async () => {
        await vitalsPage.page
          .getByRole('spinbutton', { name: /respiration rate/i })
          .fill(group.criticalVitals.respiration);
      });

      await test.step('And I click on the `Save and close` button to save the vitals', async () => {
        await vitalsPage.page.getByRole('button', { name: /save and close/i }).click();
      });

      await test.step('Then I should see a success notification confirming vitals were saved', async () => {
        await expect(vitalsPage.page.getByText(/vitals and biometrics saved/i)).toBeVisible();
      });

      await test.step('And I should see the vitals table headers', async () => {
        await expect(headerRow).toContainText(/temp/i);
        await expect(headerRow).toContainText(/bp/i);
        await expect(headerRow).toContainText(/r. rate/i);
      });

      await test.step(`And I should see the temperature value of ${group.criticalVitals.temp} in the vitals table`, async () => {
        await expect(dataRow).toContainText(group.criticalVitals.temp);
      });

      await test.step(`And I should see the blood pressure value of ${group.criticalVitals.systolic}/${group.criticalVitals.diastolic} in the vitals table`, async () => {
        await expect(dataRow).toContainText(`${group.criticalVitals.systolic} / ${group.criticalVitals.diastolic}`);
      });

      await test.step(`And I should see the respiration rate of ${group.criticalVitals.respiration} in the vitals table`, async () => {
        await expect(dataRow).toContainText(group.criticalVitals.respiration);
      });

      await test.step('And the temperature cell should have warning styling', async () => {
        const criticalCell = vitalsPage.page.getByRole('cell', { name: group.criticalVitals.temp });
        const backgroundColor = await criticalCell.evaluate((el) => window.getComputedStyle(el).backgroundColor);
        expect(backgroundColor).toBe('rgb(255, 242, 232)');

        const afterContent = await criticalCell.evaluate((el) => {
          const after = window.getComputedStyle(el, '::after');
          return after.content;
        });
        expect(afterContent).toBe('" ↑"');
      });
    });
  });
});

test.afterEach(async ({ api }) => {
  await Promise.all(createdVisits.map((visit) => endVisit(api, visit)));

  await Promise.all(createdPatients.map((patient) => deletePatient(api, patient.uuid)));
});
