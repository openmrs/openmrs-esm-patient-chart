import { expect } from '@playwright/test';
import { test } from '../core';
import { BiometricsAndVitalsPage } from '../pages';
import { type Patient, deletePatient, endVisit, generateRandomPatient, startVisit } from '../commands';
import { type Visit } from '@openmrs/esm-framework';
import { calculateBirthdate, expectCellInterpretation, type VitalInterpretation } from '../commands/test-helpers';

interface AbnormalReading {
  value: string;
  interpretation: VitalInterpretation;
}

interface AbnormalBloodPressure {
  systolic: string;
  diastolic: string;
  interpretation: VitalInterpretation;
}

interface AgeGroup {
  name: string;
  age: { years?: number; months?: number };
  // Values comfortably inside the normal band for this age — nothing should be flagged.
  normalVitals: { temperature: string; systolic: string; diastolic: string; pulse: string; respiratoryRate: string };
  // Values comfortably past the critically-high cut-off for this age — every vital should be flagged
  // critically high. Values sit clear of the band boundaries; exact inclusive-cutoff precision belongs
  // in the `assessValue` unit tests, not here.
  abnormalVitals: {
    temperature: AbnormalReading;
    bloodPressure: AbnormalBloodPressure;
    pulse: AbnormalReading;
    respiratoryRate: AbnormalReading;
  };
}

// Pulse (heart rate), respiratory rate and blood pressure use age-specific reference ranges, so each
// age group is exercised with its own patient to confirm the correct ranges are applied. Temperature
// is NOT age-specific (its range is fixed, with only a split at 3 months), so the same temperature
// values are used for every group. The preschooler (3–<4 years) row is the O3-4825 scenario.
const ageGroups: Array<AgeGroup> = [
  {
    name: 'newborn',
    age: { months: 1 },
    normalVitals: { temperature: '36.7', systolic: '75', diastolic: '45', pulse: '140', respiratoryRate: '40' },
    abnormalVitals: {
      temperature: { value: '38.5', interpretation: 'critically_high' },
      bloodPressure: { systolic: '130', diastolic: '95', interpretation: 'critically_high' },
      pulse: { value: '200', interpretation: 'critically_high' },
      respiratoryRate: { value: '70', interpretation: 'critically_high' },
    },
  },
  {
    name: 'infant',
    age: { months: 6 },
    normalVitals: { temperature: '36.7', systolic: '85', diastolic: '50', pulse: '130', respiratoryRate: '40' },
    abnormalVitals: {
      temperature: { value: '38.5', interpretation: 'critically_high' },
      bloodPressure: { systolic: '130', diastolic: '95', interpretation: 'critically_high' },
      pulse: { value: '190', interpretation: 'critically_high' },
      respiratoryRate: { value: '65', interpretation: 'critically_high' },
    },
  },
  {
    name: 'child',
    age: { years: 8 },
    normalVitals: { temperature: '36.7', systolic: '100', diastolic: '68', pulse: '85', respiratoryRate: '18' },
    abnormalVitals: {
      temperature: { value: '38.5', interpretation: 'critically_high' },
      bloodPressure: { systolic: '160', diastolic: '110', interpretation: 'critically_high' },
      pulse: { value: '140', interpretation: 'critically_high' },
      respiratoryRate: { value: '30', interpretation: 'critically_high' },
    },
  },
  {
    name: 'preschooler',
    age: { years: 3 },
    normalVitals: { temperature: '36.7', systolic: '100', diastolic: '60', pulse: '95', respiratoryRate: '25' },
    abnormalVitals: {
      temperature: { value: '38.5', interpretation: 'critically_high' },
      bloodPressure: { systolic: '145', diastolic: '100', interpretation: 'critically_high' },
      pulse: { value: '150', interpretation: 'critically_high' },
      respiratoryRate: { value: '35', interpretation: 'critically_high' },
    },
  },
  {
    name: 'adult',
    age: { years: 30 },
    normalVitals: { temperature: '36.7', systolic: '110', diastolic: '70', pulse: '80', respiratoryRate: '16' },
    abnormalVitals: {
      temperature: { value: '38.5', interpretation: 'critically_high' },
      bloodPressure: { systolic: '190', diastolic: '120', interpretation: 'critically_high' },
      pulse: { value: '130', interpretation: 'critically_high' },
      respiratoryRate: { value: '30', interpretation: 'critically_high' },
    },
  },
];

test.describe('Vitals validation for different age groups', () => {
  ageGroups.forEach((group) => {
    let patient: Patient;
    let visit: Visit;

    test.beforeEach(async ({ api }) => {
      const birthdate = await calculateBirthdate(group.age);
      patient = await generateRandomPatient(api, { birthdate });
      visit = await startVisit(api, patient.uuid);
    });

    test.afterEach(async ({ api }) => {
      await endVisit(api, visit);
      await deletePatient(api, patient.uuid);
    });

    test(`Normal vitals are not flagged for ${group.name} patient`, async ({ api, page }) => {
      const vitalsPage = new BiometricsAndVitalsPage(page);
      const headerRow = vitalsPage.vitalsHeader();
      const dataRow = vitalsPage.vitalsFirstRow();
      const { temperature, systolic, diastolic, pulse, respiratoryRate } = group.normalVitals;
      const bloodPressureRender = `${systolic} / ${diastolic}`;

      await test.step(`When I visit the vitals and biometrics page for ${group.name} patient`, async () => {
        await vitalsPage.goTo(patient.uuid);
      });

      await test.step('And I click the `Record vital signs` link to launch the form', async () => {
        await vitalsPage.page.getByText(/record vital signs/i).click();
      });

      await test.step('Then I should see the `Record Vitals and Biometrics` form launch in the workspace', async () => {
        await expect(vitalsPage.page.getByText(/record vitals and biometrics/i)).toBeVisible();
      });

      await test.step(`When I enter the temperature: ${temperature}`, async () => {
        await vitalsPage.page.getByRole('spinbutton', { name: /temperature/i }).fill(temperature);
      });

      await test.step(`And I enter the systolic blood pressure: ${systolic}`, async () => {
        await vitalsPage.page.getByRole('spinbutton', { name: /systolic/i }).fill(systolic);
      });

      await test.step(`And I enter the diastolic blood pressure: ${diastolic}`, async () => {
        await vitalsPage.page.getByRole('spinbutton', { name: /diastolic/i }).fill(diastolic);
      });

      await test.step(`And I enter the pulse: ${pulse}`, async () => {
        await vitalsPage.page.getByRole('spinbutton', { name: /pulse/i }).fill(pulse);
      });

      await test.step(`And I enter the respiration rate: ${respiratoryRate}`, async () => {
        await vitalsPage.page.getByRole('spinbutton', { name: /respiration rate/i }).fill(respiratoryRate);
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
        await expect(headerRow).toContainText(/pulse/i);
        await expect(headerRow).toContainText(/r. rate/i);
      });

      await test.step('And I should see the recorded values in the vitals table', async () => {
        await expect(dataRow).toContainText(temperature);
        await expect(dataRow).toContainText(bloodPressureRender);
        await expect(dataRow).toContainText(pulse);
        await expect(dataRow).toContainText(respiratoryRate);
      });

      await test.step('And none of the vitals should be flagged', async () => {
        await expectCellInterpretation(vitalsPage.page, temperature, 'normal');
        await expectCellInterpretation(vitalsPage.page, bloodPressureRender, 'normal');
        await expectCellInterpretation(vitalsPage.page, pulse, 'normal');
        await expectCellInterpretation(vitalsPage.page, respiratoryRate, 'normal');
      });
    });

    test(`Critically high vitals are flagged for ${group.name} patient`, async ({ api, page }) => {
      const vitalsPage = new BiometricsAndVitalsPage(page);
      const headerRow = vitalsPage.vitalsHeader();
      const dataRow = vitalsPage.vitalsFirstRow();
      const { temperature, bloodPressure, pulse, respiratoryRate } = group.abnormalVitals;
      const bloodPressureRender = `${bloodPressure.systolic} / ${bloodPressure.diastolic}`;

      await test.step(`When I visit the vitals and biometrics page for ${group.name} patient`, async () => {
        await vitalsPage.goTo(patient.uuid);
      });

      await test.step('And I click the `Record vital signs` link to launch the form', async () => {
        await vitalsPage.page.getByText(/record vital signs/i).click();
      });

      await test.step('Then I should see the `Record Vitals and Biometrics` form launch in the workspace', async () => {
        await expect(vitalsPage.page.getByText(/record vitals and biometrics/i)).toBeVisible();
      });

      await test.step(`When I enter the temperature: ${temperature.value}`, async () => {
        await vitalsPage.page.getByRole('spinbutton', { name: /temperature/i }).fill(temperature.value);
      });

      await test.step(`And I enter the systolic blood pressure: ${bloodPressure.systolic}`, async () => {
        await vitalsPage.page.getByRole('spinbutton', { name: /systolic/i }).fill(bloodPressure.systolic);
      });

      await test.step(`And I enter the diastolic blood pressure: ${bloodPressure.diastolic}`, async () => {
        await vitalsPage.page.getByRole('spinbutton', { name: /diastolic/i }).fill(bloodPressure.diastolic);
      });

      await test.step(`And I enter the pulse: ${pulse.value}`, async () => {
        await vitalsPage.page.getByRole('spinbutton', { name: /pulse/i }).fill(pulse.value);
      });

      await test.step(`And I enter the respiration rate: ${respiratoryRate.value}`, async () => {
        await vitalsPage.page.getByRole('spinbutton', { name: /respiration rate/i }).fill(respiratoryRate.value);
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
        await expect(headerRow).toContainText(/pulse/i);
        await expect(headerRow).toContainText(/r. rate/i);
      });

      await test.step('And I should see the recorded values in the vitals table', async () => {
        await expect(dataRow).toContainText(temperature.value);
        await expect(dataRow).toContainText(bloodPressureRender);
        await expect(dataRow).toContainText(pulse.value);
        await expect(dataRow).toContainText(respiratoryRate.value);
      });

      await test.step('And the temperature cell should be flagged critically high', async () => {
        await expectCellInterpretation(vitalsPage.page, temperature.value, temperature.interpretation);
      });

      await test.step('And the blood pressure cell should be flagged critically high', async () => {
        await expectCellInterpretation(vitalsPage.page, bloodPressureRender, bloodPressure.interpretation);
      });

      await test.step('And the pulse cell should be flagged critically high', async () => {
        await expectCellInterpretation(vitalsPage.page, pulse.value, pulse.interpretation);
      });

      await test.step('And the respiration rate cell should be flagged critically high', async () => {
        await expectCellInterpretation(vitalsPage.page, respiratoryRate.value, respiratoryRate.interpretation);
      });
    });
  });
});
