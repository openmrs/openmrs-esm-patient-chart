import { expect, type Page } from '@playwright/test';
import { test } from '../core';
import { BiometricsAndVitalsPage } from '../pages';
import { type Patient, deletePatient, endVisit, generateRandomPatient, startVisit } from '../commands';
import { type Visit } from '@openmrs/esm-framework';
import { calculateBirthdate, getAfterContent, getBackgroundColor } from '../commands/test-helpers';

// Background color + trailing indicator that the vitals table renders for each interpretation
// level (see the NumericObservation `cell` variant in @openmrs/esm-styleguide). The indicator is
// emitted as CSS `::after` content, which the browser also folds into the cell's accessible name —
// so the same string both locates the cell by role/name and is asserted as the `::after` content.
const interpretationCellStyles: Record<string, { backgroundColor: string; indicator: string }> = {
  normal: { backgroundColor: 'rgba(0, 0, 0, 0)', indicator: '' },
  high: { backgroundColor: 'rgb(255, 242, 232)', indicator: ' ↑' },
  low: { backgroundColor: 'rgb(255, 242, 232)', indicator: ' ↓' },
  critically_high: { backgroundColor: 'rgb(255, 215, 217)', indicator: ' ↑↑' },
  critically_low: { backgroundColor: 'rgb(255, 215, 217)', indicator: ' ↓↓' },
};

// Asserts that the table cell displaying `displayValue` (e.g. `38.5` or `145 / 100`) is styled for
// the given interpretation: the colored background and the ↑/↓ indicator live on the inner `div`
// rendered by NumericObservation, so we read the styling from there.
async function expectCellInterpretation(page: Page, displayValue: string, interpretation: string) {
  const { backgroundColor, indicator } = interpretationCellStyles[interpretation];
  // Match the accessible name exactly: an unflagged cell's name is just its value, which would
  // otherwise substring-match the blood-pressure cell (e.g. `100` in `100 / 60`) or the timestamp
  // cell (e.g. `25` in a `10:25` time). The ↑/↓ indicator is folded into the accessible name.
  const styledContent = page
    .getByRole('cell', { name: `${displayValue}${indicator}`, exact: true })
    .locator('div')
    .first();

  expect(await getBackgroundColor(styledContent)).toBe(backgroundColor);
  expect(await getAfterContent(styledContent)).toBe(interpretation === 'normal' ? 'none' : `"${indicator}"`);
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

    test(`Normal vitals validation for ${group.name} patient`, async ({ api, page }) => {
      const vitalsPage = new BiometricsAndVitalsPage(page);
      const headerRow = vitalsPage.vitalsHeader();
      const dataRow = vitalsPage.vitalsFirstRow();

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
        const backgroundColor = await getBackgroundColor(normalCell);

        expect(backgroundColor).toBe('rgb(255, 255, 255)');
        const afterContent = await getAfterContent(normalCell);
        expect(afterContent).toBe('none');
      });
    });

    test(`Critical range vitals validation flagging for ${group.name} patient`, async ({ api, page }) => {
      const vitalsPage = new BiometricsAndVitalsPage(page);
      const headerRow = vitalsPage.vitalsHeader();
      const dataRow = vitalsPage.vitalsFirstRow();

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
        const backgroundColor = await criticalCell.evaluate(
          (el) => window.getComputedStyle(el.querySelector('div')).backgroundColor,
        );
        expect(backgroundColor).toBe('rgb(255, 242, 232)');

        const afterContent = await criticalCell.evaluate((el) => {
          const after = window.getComputedStyle(el.querySelector('div'), '::after');
          return after.content;
        });
        expect(afterContent).toBe('" ↑"');
      });

      // Respiratory rate styling assertions are not possible yet because the vitals
      // table relies on backend-provided FHIR observation interpretation, which is not
      // set for respiratory rate. The vitals header cards DO show correct age-based
      // styling because they use NumericObservation with client-side reference range
      // lookup. Once #3180 (NumericObservation migration) lands, the table cells will
      // also calculate interpretation client-side and these assertions can be added.
    });
  });
});

// Preschooler (Preschool 3–<4 years) scenario for O3-4825. Records a critically unwell 3-year-old —
// tachycardia, tachypnea, hypertension and fever — and asserts that every age-sensitive vital (heart
// rate/pulse, breathing rate, blood pressure and temperature) is flagged critically high. The values
// sit clear of the 3–<4 critical cut-offs (HR ≥136, R.rate ≥33, BP ≥140/95, temp ≥38), so the child's
// age-specific reference ranges must resolve correctly for the flags to render.
test.describe('Preschooler vital signs validation (3-<4 years)', () => {
  let patient: Patient;
  let visit: Visit;

  test.beforeEach(async ({ api }) => {
    const birthdate = await calculateBirthdate({ years: 3 });
    patient = await generateRandomPatient(api, { birthdate });
    visit = await startVisit(api, patient.uuid);
  });

  test.afterEach(async ({ api }) => {
    await endVisit(api, visit);
    await deletePatient(api, patient.uuid);
  });

  test('Critically high vitals are flagged for a preschooler', async ({ api, page }) => {
    const vitalsPage = new BiometricsAndVitalsPage(page);
    const headerRow = vitalsPage.vitalsHeader();
    const dataRow = vitalsPage.vitalsFirstRow();

    const temperature = '38.5'; // critical high ≥38 °C
    const systolic = '145'; // critical high systolic ≥140 mmHg
    const diastolic = '100'; // critical high diastolic ≥95 mmHg
    const pulse = '150'; // critical high ≥136 bpm
    const respiration = '35'; // critical high ≥33 breaths/min
    const bloodPressureRender = `${systolic} / ${diastolic}`;

    await test.step('When I visit the vitals and biometrics page for the preschooler', async () => {
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

    await test.step(`And I enter the respiration rate: ${respiration}`, async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /respiration rate/i }).fill(respiration);
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
      await expect(dataRow).toContainText(respiration);
    });

    await test.step('And the temperature cell should be flagged as critically high', async () => {
      await expectCellInterpretation(vitalsPage.page, temperature, 'critically_high');
    });

    await test.step('And the blood pressure cell should be flagged as critically high', async () => {
      await expectCellInterpretation(vitalsPage.page, bloodPressureRender, 'critically_high');
    });

    await test.step('And the pulse cell should be flagged as critically high', async () => {
      await expectCellInterpretation(vitalsPage.page, pulse, 'critically_high');
    });

    await test.step('And the respiration rate cell should be flagged as critically high', async () => {
      await expectCellInterpretation(vitalsPage.page, respiration, 'critically_high');
    });
  });

  test('Normal vitals are not flagged for a preschooler', async ({ api, page }) => {
    const vitalsPage = new BiometricsAndVitalsPage(page);
    const headerRow = vitalsPage.vitalsHeader();
    const dataRow = vitalsPage.vitalsFirstRow();

    // Each value sits inside the 3–<4 normal band, so none should be flagged — this guards against
    // false positives where a healthy preschooler's vitals would be wrongly styled as abnormal.
    const temperature = '36.7'; // normal 36–37.7 °C
    const systolic = '102'; // normal systolic 90–110 mmHg
    const diastolic = '68'; // normal diastolic 47–75 mmHg
    const pulse = '95'; // normal 86–123 bpm
    const respiration = '25'; // normal 21–29 breaths/min
    const bloodPressureRender = `${systolic} / ${diastolic}`;

    await test.step('When I visit the vitals and biometrics page for the preschooler', async () => {
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

    await test.step(`And I enter the respiration rate: ${respiration}`, async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /respiration rate/i }).fill(respiration);
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
      await expect(dataRow).toContainText(respiration);
    });

    await test.step('And the temperature cell should not be flagged', async () => {
      await expectCellInterpretation(vitalsPage.page, temperature, 'normal');
    });

    await test.step('And the blood pressure cell should not be flagged', async () => {
      await expectCellInterpretation(vitalsPage.page, bloodPressureRender, 'normal');
    });

    await test.step('And the pulse cell should not be flagged', async () => {
      await expectCellInterpretation(vitalsPage.page, pulse, 'normal');
    });

    await test.step('And the respiration rate cell should not be flagged', async () => {
      await expectCellInterpretation(vitalsPage.page, respiration, 'normal');
    });
  });
});
