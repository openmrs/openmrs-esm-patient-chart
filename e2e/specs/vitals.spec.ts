import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import { generateRandomPatient, deletePatient, type Patient, startVisit, endVisit } from '../commands';
import { test } from '../core';
import { BiometricsAndVitalsPage } from '../pages';

let patient: Patient;
let visit: Visit;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
});

test('Add, edit and delete patient vitals', async ({ page }) => {
  const vitalsPage = new BiometricsAndVitalsPage(page);
  const headerRow = vitalsPage.vitalsTable().locator('thead > tr');
  const dataRow = vitalsPage.vitalsTable().locator('tbody > tr');

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
    await vitalsPage.page
      .getByRole('button', { name: /options/i })
      .nth(0)
      .click();
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
    await vitalsPage.page
      .getByRole('button', { name: /options/i })
      .nth(0)
      .click();
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

test('Add low and critically low range patient vitals', async ({ page }) => {
  const vitalsPage = new BiometricsAndVitalsPage(page);
  const headerRow = vitalsPage.vitalsTable().locator('thead > tr');
  const dataRow = vitalsPage.vitalsTable().locator('tbody > tr');

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

  await test.step('And I fill `17` as the respiration rate', async () => {
    await vitalsPage.page.getByRole('spinbutton', { name: /respiration rate/i }).fill('17');
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
    await expect(dataRow).toContainText('17');
    await expect(dataRow).toContainText('91');
    const lowRange = vitalsPage.page.getByRole('cell', { name: '91 ↓' });
    const criticallyLowRange = vitalsPage.page.getByRole('cell', { name: '17 ↓↓' });
    const backgroundColor = await lowRange.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(backgroundColor).toBe('rgb(255, 242, 232)');

    const lowRangeContent = await lowRange.evaluate((el) => {
      const after = window.getComputedStyle(el, '::after');
      return after.content;
    });
    expect(lowRangeContent).toBe('" ↓"');

    const backgroundColorLow = await criticallyLowRange.evaluate((el) => window.getComputedStyle(el).backgroundColor);

    expect(backgroundColorLow).toBe('rgb(255, 215, 217)');
    const criticalLowRangeContent = await criticallyLowRange.evaluate((el) => {
      const after = window.getComputedStyle(el, '::after');
      return after.content;
    });
    expect(criticalLowRangeContent).toBe('" ↓↓"');
  });
});

test('Add high and critically high range patient vitals', async ({ page }) => {
  const vitalsPage = new BiometricsAndVitalsPage(page);
  const headerRow = vitalsPage.vitalsTable().locator('thead > tr');
  const dataRow = vitalsPage.vitalsTable().locator('tbody > tr');

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

    const backgroundColor = await highRange.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(backgroundColor).toBe('rgb(255, 242, 232)');

    const afterContent = await highRange.evaluate((el) => {
      const after = window.getComputedStyle(el, '::after');
      return after.content;
    });

    expect(afterContent).toBe('" ↑"');

    const backgroundColorLow = await criticallyHighRange.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(backgroundColorLow).toBe('rgb(255, 215, 217)');

    const afterContentLow = await criticallyHighRange.evaluate((el) => {
      const after = window.getComputedStyle(el, '::after');
      return after.content;
    });
    expect(afterContentLow).toBe('" ↑↑"');
  });
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit);
  await deletePatient(api, patient.uuid);
});
