import { expect } from '@playwright/test';
import { test } from '../core';
import { BiometricsAndVitalsPage } from '../pages';

test('Add, edit and delete patient vitals', async ({ page, patient }) => {
  const vitalsPage = new BiometricsAndVitalsPage(page);
  const headerRow = vitalsPage.vitalsTable().locator('thead > tr');
  const dataRow = vitalsPage.vitalsTable().locator('tbody > tr').first();

  await test.step('When I visit the vitals and biometrics page', async () => {
    await vitalsPage.goTo(patient.uuid);
  });

  await test.step('And I click the `Record biometrics` link to launch the form', async () => {
    await vitalsPage.page.getByText(/record vital signs/i).click();
  });

  await test.step('Then I should see the `Record Vitals and Biometrics` form launch in the workspace', async () => {
    await expect(vitalsPage.page.getByText(/record vitals and biometrics/i)).toBeVisible();
  });

  await test.step('When I fill `37` as the temperature', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /temperature/i }).fill('37');
  });

  await test.step('And I fill `120` as the systolic', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /systolic/i }).fill('120');
  });

  await test.step('And I fill `100` as the diastolic', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /diastolic/i }).fill('100');
  });

  await test.step('And I fill `65` as the pulse', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /pulse/i }).fill('65');
  });

  await test.step('And I fill `16` as the respiration rate', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /respiration rate/i }).fill('16');
  });

  await test.step('And I fill `98` as the oxygen saturation', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /oxygen saturation/i }).fill('98');
  });

  await test.step('And I add additional notes', async () => {
    await vitalsPage.page.getByPlaceholder(/type any additional notes here/i).fill('Test notes');
  });

  await test.step('And I click on the `Save and close` button', async () => {
    await vitalsPage.page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(vitalsPage.page.getByText(/vitals and biometrics saved/i)).toBeVisible();
  });

  await test.step('And I should see the newly recorded vital signs on the page', async () => {
    await expect(headerRow).toContainText(/temp/i);
    await expect(headerRow).toContainText(/bp/i);
    await expect(headerRow).toContainText(/pulse/i);
    await expect(headerRow).toContainText(/r. rate/i);
    await expect(headerRow).toContainText(/SPO2/i);
    await expect(dataRow).toContainText('37');
    await expect(dataRow).toContainText('120 / 100');
    await expect(dataRow).toContainText('65');
    await expect(dataRow).toContainText('16');
    await expect(dataRow).toContainText('98');
  });

  await test.step('When I click the overflow menu on the vitals row', async () => {
    await dataRow.getByRole('button', { name: /options/i }).click();
  });

  await test.step('And I click on the `Edit` button', async () => {
    await page.getByRole('menuitem', { name: /edit/i }).click();
  });

  await test.step('Then I should see the `Edit Vitals and Biometrics` form launch in the workspace', async () => {
    await expect(vitalsPage.page.getByText(/edit vitals and biometrics/i)).toBeVisible();
    await expect(vitalsPage.page.getByRole('spinbutton', { name: /temperature/i })).toHaveValue('37');
    await expect(vitalsPage.page.getByRole('spinbutton', { name: /systolic/i })).toHaveValue('120');
    await expect(vitalsPage.page.getByRole('spinbutton', { name: /diastolic/i })).toHaveValue('100');
    await expect(vitalsPage.page.getByRole('spinbutton', { name: /pulse/i })).toHaveValue('65');
    await expect(vitalsPage.page.getByRole('spinbutton', { name: /respiration rate/i })).toHaveValue('16');
    await expect(vitalsPage.page.getByRole('spinbutton', { name: /oxygen saturation/i })).toHaveValue('98');
  });

  await test.step('When I fill `38` as the temperature', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /temperature/i }).clear();
    await vitalsPage.page.getByRole('spinbutton', { name: /temperature/i }).fill('38');
  });

  await test.step('And I fill `130` as the systolic', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /systolic/i }).clear();
    await vitalsPage.page.getByRole('spinbutton', { name: /systolic/i }).fill('130');
  });

  await test.step('And I fill `110` as the diastolic', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /diastolic/i }).clear();
    await vitalsPage.page.getByRole('spinbutton', { name: /diastolic/i }).fill('110');
  });

  await test.step('And I click on the `Save and close` button', async () => {
    await vitalsPage.page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(vitalsPage.page.getByText(/vitals and biometrics updated/i)).toBeVisible();
  });

  await test.step('And I should see the updated vitals on the page', async () => {
    await expect(headerRow).toContainText(/temp/i);
    await expect(headerRow).toContainText(/bp/i);
    await expect(headerRow).toContainText(/pulse/i);
    await expect(headerRow).toContainText(/r. rate/i);
    await expect(headerRow).toContainText(/SPO2/i);
    await expect(dataRow).toContainText('38');
    await expect(dataRow).toContainText('130 / 110');
    await expect(dataRow).toContainText('65');
    await expect(dataRow).toContainText('16');
    await expect(dataRow).toContainText('98');
  });

  await test.step('When I click the overflow menu on the vitals row', async () => {
    await dataRow.getByRole('button', { name: /options/i }).click();
  });

  await test.step('And I click on the `Delete` button', async () => {
    await page.getByRole('menuitem', { name: /delete/i }).click();
    await page.getByRole('button', { name: /delete/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(vitalsPage.page.getByText(/Vitals and biometrics deleted/i)).toBeVisible();
  });

  await test.step('And the vitals table should be empty', async () => {
    await expect(vitalsPage.page.getByText(/There are no vital signs to display for this patient/i)).toBeVisible();
  });
});

test('Add low and critically low range patient vitals', async ({ page, patient }) => {
  const vitalsPage = new BiometricsAndVitalsPage(page);
  const headerRow = vitalsPage.vitalsTable().locator('thead > tr');
  const dataRow = vitalsPage.vitalsTable().locator('tbody > tr').first();

  await test.step('When I visit the vitals and biometrics page', async () => {
    await vitalsPage.goTo(patient.uuid);
  });

  await test.step('And I click the `Record biometrics` link to launch the form', async () => {
    await vitalsPage.page.getByText(/record vital signs/i).click();
  });

  await test.step('Then I should see the `Record Vitals and Biometrics` form launch in the workspace', async () => {
    await expect(vitalsPage.page.getByText(/record vitals and biometrics/i)).toBeVisible();
  });

  await test.step('When I fill `35` as the temperature', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /temperature/i }).fill('35');
  });

  await test.step('And I fill `90` as the systolic', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /systolic/i }).fill('90');
  });

  await test.step('And I fill `30` as the diastolic', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /diastolic/i }).fill('30');
  });

  await test.step('And I fill `80` as the pulse', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /pulse/i }).fill('80');
  });

  await test.step('And I fill `15` as the respiration rate', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /respiration rate/i }).fill('15');
  });

  await test.step('And I fill `91` as the oxygen saturation', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /oxygen saturation/i }).fill('91');
  });

  await test.step('And I add additional notes', async () => {
    await vitalsPage.page.getByPlaceholder(/type any additional notes here/i).fill('Test notes');
  });

  await test.step('And I click on the `Save and close` button', async () => {
    await vitalsPage.page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(vitalsPage.page.getByText(/vitals and biometrics saved/i)).toBeVisible();
  });

  await test.step('And I should see the newly recorded vital signs on the page', async () => {
    await expect(headerRow).toContainText(/temp/i);
    await expect(headerRow).toContainText(/bp/i);
    await expect(headerRow).toContainText(/pulse/i);
    await expect(headerRow).toContainText(/r. rate/i);
    await expect(headerRow).toContainText(/SPO2/i);
    await expect(dataRow).toContainText('35');
    await expect(dataRow).toContainText('90 / 30');
    await expect(dataRow).toContainText('80');
    await expect(dataRow).toContainText('15');
    await expect(dataRow).toContainText('91');
    const lowRange = vitalsPage.page.getByRole('cell', { name: '91 ↓' });
    const criticallyLowRange = vitalsPage.page.getByRole('cell', { name: '15 ↓↓' });
    const backgroundColor = await lowRange.evaluate(
      (el) => window.getComputedStyle(el.querySelector('div')).backgroundColor,
    );
    expect(backgroundColor).toBe('rgb(255, 242, 232)');

    const lowRangeContent = await lowRange.evaluate((el) => {
      const after = window.getComputedStyle(el.querySelector('div'), '::after');
      return after.content;
    });
    expect(lowRangeContent).toBe('" ↓"');

    const backgroundColorLow = await criticallyLowRange.evaluate(
      (el) => window.getComputedStyle(el.querySelector('div')).backgroundColor,
    );

    expect(backgroundColorLow).toBe('rgb(255, 215, 217)');
    const criticalLowRangeContent = await criticallyLowRange.evaluate((el) => {
      const after = window.getComputedStyle(el.querySelector('div'), '::after');
      return after.content;
    });
    expect(criticalLowRangeContent).toBe('" ↓↓"');
  });
});

test('Add high and critically high range patient vitals', async ({ page, patient }) => {
  const vitalsPage = new BiometricsAndVitalsPage(page);
  const headerRow = vitalsPage.vitalsTable().locator('thead > tr');
  const dataRow = vitalsPage.vitalsTable().locator('tbody > tr').first();

  await test.step('When I visit the vitals and biometrics page', async () => {
    await vitalsPage.goTo(patient.uuid);
  });

  await test.step('And I click the `Record biometrics` link to launch the form', async () => {
    await vitalsPage.page.getByText(/record vital signs/i).click();
  });

  await test.step('Then I should see the `Record Vitals and Biometrics` form launch in the workspace', async () => {
    await expect(vitalsPage.page.getByText(/record vitals and biometrics/i)).toBeVisible();
  });

  await test.step('When I fill `38` as the temperature', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /temperature/i }).fill('38');
  });

  await test.step('And I fill `125` as the systolic', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /systolic/i }).fill('125');
  });

  await test.step('And I fill `78` as the diastolic', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /diastolic/i }).fill('78');
  });

  await test.step('And I fill `200` as the pulse', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /pulse/i }).fill('200');
  });

  await test.step('And I fill `20` as the respiration rate', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /respiration rate/i }).fill('20');
  });

  await test.step('And I fill `91` as the oxygen saturation', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /oxygen saturation/i }).fill('91');
  });

  await test.step('And I add additional notes', async () => {
    await vitalsPage.page.getByPlaceholder(/type any additional notes here/i).fill('Test notes');
  });

  await test.step('And I click on the `Save and close` button', async () => {
    await vitalsPage.page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(vitalsPage.page.getByText(/vitals and biometrics saved/i)).toBeVisible();
  });

  await test.step('And I should see the newly recorded vital signs on the page', async () => {
    await expect(headerRow).toContainText(/temp/i);
    await expect(headerRow).toContainText(/bp/i);
    await expect(headerRow).toContainText(/pulse/i);
    await expect(headerRow).toContainText(/r. rate/i);
    await expect(headerRow).toContainText(/SPO2/i);
    await expect(dataRow).toContainText('38');
    await expect(dataRow).toContainText('125 / 78');
    await expect(dataRow).toContainText('200');
    await expect(dataRow).toContainText('20');
    await expect(dataRow).toContainText('91');
    const highRange = vitalsPage.page.getByRole('cell', { name: '38 ↑' });
    const criticallyHighRange = vitalsPage.page.getByRole('cell', { name: '200 ↑↑' });

    const backgroundColor = await highRange.evaluate(
      (el) => window.getComputedStyle(el.querySelector('div')).backgroundColor,
    );
    expect(backgroundColor).toBe('rgb(255, 215, 217)');

    const afterContent = await highRange.evaluate((el) => {
      const after = window.getComputedStyle(el.querySelector('div'), '::after');
      return after.content;
    });

    expect(afterContent).toBe('" ↑↑"');

    const backgroundColorLow = await criticallyHighRange.evaluate(
      (el) => window.getComputedStyle(el.querySelector('div')).backgroundColor,
    );
    expect(backgroundColorLow).toBe('rgb(255, 215, 217)');

    const afterContentLow = await criticallyHighRange.evaluate((el) => {
      const after = window.getComputedStyle(el.querySelector('div'), '::after');
      return after.content;
    });
    expect(afterContentLow).toBe('" ↑↑"');
  });
});

test('Show an error when saving vitals with no values entered', async ({ page, patient }) => {
  const vitalsPage = new BiometricsAndVitalsPage(page);
  const saveButton = vitalsPage.page.getByRole('button', { name: /save and close/i });

  await test.step('When I visit the vitals and biometrics page', async () => {
    await vitalsPage.goTo(patient.uuid);
  });

  await test.step('And I click the `Record vital signs` link to launch the form', async () => {
    await vitalsPage.page.getByText(/record vital signs/i).click();
  });

  await test.step('Then I should see the `Record Vitals and Biometrics` form launch in the workspace', async () => {
    await expect(vitalsPage.page.getByText(/record vitals and biometrics/i)).toBeVisible();
  });

  await test.step('And the `Save and close` button should be disabled while the form is pristine', async () => {
    await expect(saveButton).toBeDisabled();
  });

  await test.step('When I type a note and then erase it', async () => {
    await vitalsPage.page.getByPlaceholder(/type any additional notes here/i).fill('Test notes');
    await vitalsPage.page.getByPlaceholder(/type any additional notes here/i).clear();
  });

  await test.step('And I click on the `Save and close` button', async () => {
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
  });

  await test.step('Then I should see an error notification prompting me to fill at least one field', async () => {
    await expect(vitalsPage.page.getByText(/please fill at least one field/i)).toBeVisible();
  });

  await test.step('And no vitals should be recorded for the patient', async () => {
    await expect(vitalsPage.page.getByText(/vitals and biometrics saved/i)).toBeHidden();
  });
});

test('Show an error when saving vitals with a value outside the allowed range', async ({ page, patient, api }) => {
  const vitalsPage = new BiometricsAndVitalsPage(page);
  let hiAbsolute: number;

  await test.step('Given the oxygen saturation concept defines an absolute maximum below the value under test', async () => {
    const oxygenSaturationConceptUuid = '5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    const res = await api.get(`concept/${oxygenSaturationConceptUuid}?v=custom:(hiAbsolute)`);
    hiAbsolute = (await res.json()).hiAbsolute;
    expect(
      hiAbsolute,
      `The oxygen saturation concept must define a hiAbsolute below 101 for this test to be valid; got ${hiAbsolute}. Check the concept dictionary in the e2e environment.`,
    ).toBeLessThan(101);
  });

  await test.step('When I visit the vitals and biometrics page', async () => {
    await vitalsPage.goTo(patient.uuid);
  });

  await test.step('And I click the `Record vital signs` link to launch the form', async () => {
    await vitalsPage.page.getByText(/record vital signs/i).click();
  });

  await test.step('Then I should see the `Record Vitals and Biometrics` form launch in the workspace', async () => {
    await expect(vitalsPage.page.getByText(/record vitals and biometrics/i)).toBeVisible();
  });

  await test.step('And the absolute ranges should have loaded into the form', async () => {
    // The range check no-ops until the conceptreferencerange request resolves;
    // the input's max attribute is populated from that same response.
    await expect(vitalsPage.page.getByRole('spinbutton', { name: /oxygen saturation/i })).toHaveAttribute(
      'max',
      String(hiAbsolute),
    );
  });

  await test.step('When I fill `101` as the oxygen saturation', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /oxygen saturation/i }).fill('101');
  });

  await test.step('And I click on the `Save and close` button', async () => {
    await vitalsPage.page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a field-level error indicating the allowed range', async () => {
    await expect(vitalsPage.page.getByText(/value must be between/i)).toBeVisible();
  });

  await test.step('And I should see an error notification about invalid values', async () => {
    await expect(vitalsPage.page.getByText(/error saving vitals and biometrics/i)).toBeVisible();
    await expect(vitalsPage.page.getByText(/some of the values entered are invalid/i)).toBeVisible();
  });

  await test.step('And no vitals should be recorded for the patient', async () => {
    await expect(vitalsPage.page.getByText(/vitals and biometrics saved/i)).toBeHidden();
  });
});
