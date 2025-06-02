import { expect } from '@playwright/test';
import { test } from '../core';
import { BiometricsAndVitalsPage } from '../pages';
import { endVisit, startVisit } from '../commands';
import { type Visit } from '@openmrs/esm-framework';

let newbornVisit: Visit;
let infantVisit: Visit;
let childVisit: Visit;
let adultVisit: Visit;

test.describe('Vitals validation for different age groups', () => {
  test('Add new born normal care vitals signs validation', async ({ api, page, newbornPatient }) => {
    newbornVisit = await startVisit(api, newbornPatient.uuid);
    const vitalsPage = new BiometricsAndVitalsPage(page);
    const headerRow = vitalsPage.vitalsTable().locator('thead > tr');
    const dataRow = vitalsPage.vitalsTable().locator('tbody > tr');

    await test.step('When I visit the vitals and biometrics page', async () => {
      await vitalsPage.goTo(newbornPatient.uuid);
    });

    await test.step('And I click the `Record biometrics` link to launch the form', async () => {
      await vitalsPage.page.getByText(/record vital signs/i).click();
    });

    await test.step('Then I should see the `Record Vitals and Biometrics` form launch in the workspace', async () => {
      await expect(vitalsPage.page.getByText(/record vitals and biometrics/i)).toBeVisible();
    });

    await test.step('When I fill `36.7` as the temperature', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /temperature/i }).fill('36.7');
    });

    await test.step('And I fill `125` as the systolic', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /systolic/i }).fill('80');
    });

    await test.step('And I fill `78` as the diastolic', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /diastolic/i }).fill('60');
    });

    await test.step('And I fill `40` as the respiration rate', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /respiration rate/i }).fill('40');
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
      await expect(headerRow).toContainText(/r. rate/i);
      await expect(dataRow).toContainText('36.7');
      await expect(dataRow).toContainText('80 / 60');
      await expect(dataRow).toContainText('40');
      const noramlRange = vitalsPage.page.getByRole('cell', { name: '36.7' });
      const criticallyHighRange = vitalsPage.page.getByRole('cell', { name: '40' });

      const backgroundColor = await noramlRange.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(backgroundColor).toBe('rgb(255, 255, 255)');

      const afterContent = await noramlRange.evaluate((el) => {
        const after = window.getComputedStyle(el, '::after');
        return after.content;
      });
      expect(afterContent).toBe('none');
    });
  });

  test('Newborn critical range vitals validation flagging', async ({ api, page, newbornPatient }) => {
    newbornVisit = await startVisit(api, newbornPatient.uuid);
    const vitalsPage = new BiometricsAndVitalsPage(page);
    const headerRow = vitalsPage.vitalsTable().locator('thead > tr');
    const dataRow = vitalsPage.vitalsTable().locator('tbody > tr');

    await test.step('When I visit the vitals and biometrics page', async () => {
      await vitalsPage.goTo(newbornPatient.uuid);
    });

    await test.step('And I click the `Record biometrics` link to launch the form', async () => {
      await vitalsPage.page.getByText(/record vital signs/i).click();
    });

    await test.step('Then I should see the `Record Vitals and Biometrics` form launch in the workspace', async () => {
      await expect(vitalsPage.page.getByText(/record vitals and biometrics/i)).toBeVisible();
    });

    await test.step('When I fill `37.8` as the temperature', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /temperature/i }).fill('37.8');
    });

    await test.step('And I fill `57` as the systolic', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /systolic/i }).fill('57');
    });

    await test.step('And I fill `18` as the diastolic', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /diastolic/i }).fill('18');
    });

    await test.step('And I fill `18` as the respiration rate', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /respiration rate/i }).fill('18');
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
      await expect(headerRow).toContainText(/r. rate/i);
      await expect(dataRow).toContainText('37.8');
      await expect(dataRow).toContainText('57 / 18');
      await expect(dataRow).toContainText('18');
      const highRange = vitalsPage.page.getByRole('cell', { name: '37.8' });
      const highRangeRate = vitalsPage.page.getByRole('cell', { name: '18 ↓↓', exact: true });

      const backgroundColor = await highRange.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(backgroundColor).toBe('rgb(255, 242, 232)');

      const afterContent = await highRange.evaluate((el) => {
        const after = window.getComputedStyle(el, '::after');
        return after.content;
      });

      expect(afterContent).toBe('" ↑"');

      const backgroundColorLow = await highRangeRate.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(backgroundColorLow).toBe('rgb(255, 215, 217)');

      const afterContentLow = await highRangeRate.evaluate((el) => {
        const after = window.getComputedStyle(el, '::after');
        return after.content;
      });
      expect(afterContentLow).toBe('" ↑"');
    });
  });

  test('Infant patient (6 -< 9 months) normal vitals validation', async ({ api, page, infantPatient }) => {
    infantVisit = await startVisit(api, infantPatient.uuid);
    const vitalsPage = new BiometricsAndVitalsPage(page);
    const headerRow = vitalsPage.vitalsTable().locator('thead > tr');
    const dataRow = vitalsPage.vitalsTable().locator('tbody > tr');

    await test.step('When I visit the vitals and biometrics page', async () => {
      await vitalsPage.goTo(infantPatient.uuid);
    });

    await test.step('And I click the `Record biometrics` link to launch the form', async () => {
      await vitalsPage.page.getByText(/record vital signs/i).click();
    });

    await test.step('Then I should see the `Record Vitals and Biometrics` form launch in the workspace', async () => {
      await expect(vitalsPage.page.getByText(/record vitals and biometrics/i)).toBeVisible();
    });

    await test.step('When I fill `36.7` as the temperature', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /temperature/i }).fill('36.7');
    });

    await test.step('And I fill `80` as the systolic', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /systolic/i }).fill('80');
    });

    await test.step('And I fill `50` as the diastolic', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /diastolic/i }).fill('50');
    });

    await test.step('And I fill `40` as the respiration rate', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /respiration rate/i }).fill('40');
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
      await expect(headerRow).toContainText(/r. rate/i);
      await expect(dataRow).toContainText('36.7');
      await expect(dataRow).toContainText('80 / 50');
      await expect(dataRow).toContainText('40');
      const noramlRange = vitalsPage.page.getByRole('cell', { name: '36.7' });
      const criticallyHighRange = vitalsPage.page.getByRole('cell', { name: '40' });

      const backgroundColor = await noramlRange.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(backgroundColor).toBe('rgb(255, 255, 255)');

      const afterContent = await noramlRange.evaluate((el) => {
        const after = window.getComputedStyle(el, '::after');
        return after.content;
      });
      expect(afterContent).toBe('none');
    });
  });

  test('Infant patient (6 -< 9 months) critical range vitals validation flagging', async ({
    page,
    api,
    infantPatient,
  }) => {
    infantVisit = await startVisit(api, infantPatient.uuid);
    const vitalsPage = new BiometricsAndVitalsPage(page);
    const headerRow = vitalsPage.vitalsTable().locator('thead > tr');
    const dataRow = vitalsPage.vitalsTable().locator('tbody > tr');

    await test.step('When I visit the vitals and biometrics page', async () => {
      await vitalsPage.goTo(infantPatient.uuid);
    });

    await test.step('And I click the `Record biometrics` link to launch the form', async () => {
      await vitalsPage.page.getByText(/record vital signs/i).click();
    });

    await test.step('Then I should see the `Record Vitals and Biometrics` form launch in the workspace', async () => {
      await expect(vitalsPage.page.getByText(/record vitals and biometrics/i)).toBeVisible();
    });

    await test.step('When I fill `37.8` as the temperature', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /temperature/i }).fill('37.8');
    });

    await test.step('And I fill `65` as the systolic', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /systolic/i }).fill('65');
    });

    await test.step('And I fill `37` as the diastolic', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /diastolic/i }).fill('37');
    });

    await test.step('And I fill `28` as the respiration rate', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /respiration rate/i }).fill('28');
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
      await expect(headerRow).toContainText(/r. rate/i);
      await expect(dataRow).toContainText('37.8');
      await expect(dataRow).toContainText('65 / 37');
      await expect(dataRow).toContainText('28');
      const highRange = vitalsPage.page.getByRole('cell', { name: '37.8' });
      const lowRangeRate = vitalsPage.page.getByRole('cell', { name: '28' });

      const backgroundColor = await highRange.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(backgroundColor).toBe('rgb(255, 242, 232)');

      const afterContent = await highRange.evaluate((el) => {
        const after = window.getComputedStyle(el, '::after');
        return after.content;
      });

      expect(afterContent).toBe('" ↑"');

      const backgroundColorLow = await lowRangeRate.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(backgroundColorLow).toBe('rgb(255, 242, 232)');

      const afterContentLow = await lowRangeRate.evaluate((el) => {
        const after = window.getComputedStyle(el, '::after');
        return after.content;
      });
      expect(afterContentLow).toBe('" ↓"');
    });
  });

  test('Child patient (8 years) normal vitals validation', async ({ api, page, childPatient }) => {
    childVisit = await startVisit(api, childPatient.uuid);
    const vitalsPage = new BiometricsAndVitalsPage(page);
    const headerRow = vitalsPage.vitalsTable().locator('thead > tr');
    const dataRow = vitalsPage.vitalsTable().locator('tbody > tr');

    await test.step('When I visit the vitals and biometrics page', async () => {
      await vitalsPage.goTo(childPatient.uuid);
    });

    await test.step('And I click the `Record biometrics` link to launch the form', async () => {
      await vitalsPage.page.getByText(/record vital signs/i).click();
    });

    await test.step('Then I should see the `Record Vitals and Biometrics` form launch in the workspace', async () => {
      await expect(vitalsPage.page.getByText(/record vitals and biometrics/i)).toBeVisible();
    });

    await test.step('When I fill `36.7` as the temperature', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /temperature/i }).fill('36.7');
    });

    await test.step('And I fill `100` as the systolic', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /systolic/i }).fill('100');
    });

    await test.step('And I fill `70` as the diastolic', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /diastolic/i }).fill('70');
    });

    await test.step('And I fill `18` as the respiration rate', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /respiration rate/i }).fill('18');
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
      await expect(headerRow).toContainText(/r. rate/i);
      await expect(dataRow).toContainText('36.7');
      await expect(dataRow).toContainText('100 / 70');
      await expect(dataRow).toContainText('18');
      const noramlRange = vitalsPage.page.getByRole('cell', { name: '36.7' });
      const criticallyHighRange = vitalsPage.page.getByRole('cell', { name: '18' });

      const backgroundColor = await noramlRange.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(backgroundColor).toBe('rgb(255, 255, 255)');

      const afterContent = await noramlRange.evaluate((el) => {
        const after = window.getComputedStyle(el, '::after');
        return after.content;
      });
      expect(afterContent).toBe('none');
    });
  });

  test('Child patient (8 years) critical range vitals validation flagging', async ({ api, page, childPatient }) => {
    childVisit = await startVisit(api, childPatient.uuid);
    const vitalsPage = new BiometricsAndVitalsPage(page);
    const headerRow = vitalsPage.vitalsTable().locator('thead > tr');
    const dataRow = vitalsPage.vitalsTable().locator('tbody > tr');

    await test.step('When I visit the vitals and biometrics page', async () => {
      await vitalsPage.goTo(childPatient.uuid);
    });

    await test.step('And I click the `Record biometrics` link to launch the form', async () => {
      await vitalsPage.page.getByText(/record vital signs/i).click();
    });

    await test.step('Then I should see the `Record Vitals and Biometrics` form launch in the workspace', async () => {
      await expect(vitalsPage.page.getByText(/record vitals and biometrics/i)).toBeVisible();
    });

    await test.step('When I fill `37.8` as the temperature', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /temperature/i }).fill('37.8');
    });

    await test.step('And I fill `85` as the systolic', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /systolic/i }).fill('85');
    });

    await test.step('And I fill `55` as the diastolic', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /diastolic/i }).fill('55');
    });

    await test.step('And I fill `23` as the respiration rate', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /respiration rate/i }).fill('23');
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
      await expect(headerRow).toContainText(/r. rate/i);
      await expect(dataRow).toContainText('37.8');
      await expect(dataRow).toContainText('85 / 55');
      await expect(dataRow).toContainText('23');
      const highRange = vitalsPage.page.getByRole('cell', { name: '37.8' });
      const highRangeRate = vitalsPage.page.getByRole('cell', { name: '23' });

      const backgroundColor = await highRange.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(backgroundColor).toBe('rgb(255, 242, 232)');

      const afterContent = await highRange.evaluate((el) => {
        const after = window.getComputedStyle(el, '::after');
        return after.content;
      });

      expect(afterContent).toBe('" ↑"');

      const backgroundColorLow = await highRangeRate.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(backgroundColorLow).toBe('rgb(255, 242, 232)');

      const afterContentLow = await highRangeRate.evaluate((el) => {
        const after = window.getComputedStyle(el, '::after');
        return after.content;
      });
      expect(afterContentLow).toBe('" ↑"');
    });
  });

  test('Adult (18 years and above) normal vitals validation', async ({ api, page, adultPatient }) => {
    adultVisit = await startVisit(api, adultPatient.uuid);
    const vitalsPage = new BiometricsAndVitalsPage(page);
    const headerRow = vitalsPage.vitalsTable().locator('thead > tr');
    const dataRow = vitalsPage.vitalsTable().locator('tbody > tr');

    await test.step('When I visit the vitals and biometrics page', async () => {
      await vitalsPage.goTo(adultPatient.uuid);
    });

    await test.step('And I click the `Record biometrics` link to launch the form', async () => {
      await vitalsPage.page.getByText(/record vital signs/i).click();
    });

    await test.step('Then I should see the `Record Vitals and Biometrics` form launch in the workspace', async () => {
      await expect(vitalsPage.page.getByText(/record vitals and biometrics/i)).toBeVisible();
    });

    await test.step('When I fill `36.7` as the temperature', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /temperature/i }).fill('36.7');
    });

    await test.step('And I fill `115` as the systolic', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /systolic/i }).fill('115');
    });

    await test.step('And I fill `70` as the diastolic', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /diastolic/i }).fill('70');
    });

    await test.step('And I fill `16` as the respiration rate', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /respiration rate/i }).fill('16');
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
      await expect(headerRow).toContainText(/r. rate/i);
      await expect(dataRow).toContainText('36.7');
      await expect(dataRow).toContainText('115 / 70');
      await expect(dataRow).toContainText('16');
      const noramlRange = vitalsPage.page.getByRole('cell', { name: '36.7' });
      const criticallyHighRange = vitalsPage.page.getByRole('cell', { name: '16' });

      const backgroundColor = await noramlRange.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(backgroundColor).toBe('rgb(255, 255, 255)');

      const afterContent = await noramlRange.evaluate((el) => {
        const after = window.getComputedStyle(el, '::after');
        return after.content;
      });
      expect(afterContent).toBe('none');
    });
  });

  test('Adult (eighteen years and above) critical range vitals validation flagging', async ({
    api,
    page,
    adultPatient,
  }) => {
    adultVisit = await startVisit(api, adultPatient.uuid);
    const vitalsPage = new BiometricsAndVitalsPage(page);
    const headerRow = vitalsPage.vitalsTable().locator('thead > tr');
    const dataRow = vitalsPage.vitalsTable().locator('tbody > tr');

    await test.step('When I visit the vitals and biometrics page', async () => {
      await vitalsPage.goTo(adultPatient.uuid);
    });

    await test.step('And I click the `Record biometrics` link to launch the form', async () => {
      await vitalsPage.page.getByText(/record vital signs/i).click();
    });

    await test.step('Then I should see the `Record Vitals and Biometrics` form launch in the workspace', async () => {
      await expect(vitalsPage.page.getByText(/record vitals and biometrics/i)).toBeVisible();
    });

    await test.step('When I fill `37.8` as the temperature', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /temperature/i }).fill('37.8');
    });

    await test.step('And I fill `97` as the systolic', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /systolic/i }).fill('97');
    });

    await test.step('And I fill `57` as the diastolic', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /diastolic/i }).fill('57');
    });

    await test.step('And I fill `11` as the respiration rate', async () => {
      await vitalsPage.page.getByRole('spinbutton', { name: /respiration rate/i }).fill('11');
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
      await expect(headerRow).toContainText(/r. rate/i);
      await expect(dataRow).toContainText('37.8');
      await expect(dataRow).toContainText('97 / 57');
      await expect(dataRow).toContainText('11');
      const highRange = vitalsPage.page.getByRole('cell', { name: '37.8' });
      const highRangeRate = vitalsPage.page.getByRole('cell', { name: '11' });

      const backgroundColor = await highRange.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(backgroundColor).toBe('rgb(255, 242, 232)');

      const afterContent = await highRange.evaluate((el) => {
        const after = window.getComputedStyle(el, '::after');
        return after.content;
      });

      expect(afterContent).toBe('" ↑"');

      const backgroundColorLow = await highRangeRate.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(backgroundColorLow).toBe('rgb(255, 242, 232)');

      const afterContentLow = await highRangeRate.evaluate((el) => {
        const after = window.getComputedStyle(el, '::after');
        return after.content;
      });
      expect(afterContentLow).toBe('" ↓"');
    });
  });
});

test.afterEach(async ({ api }) => {
  if (newbornVisit) {
    try {
      await endVisit(api, newbornVisit);
    } catch (e) {
      console.warn('Failed to delete newborn visit:', e);
    }
  }

  if (infantVisit) {
    try {
      await endVisit(api, infantVisit);
    } catch (e) {
      console.warn('Failed to delete infantVisit:', e);
    }
  }

  if (childVisit) {
    try {
      await endVisit(api, childVisit);
    } catch (e) {
      console.warn('Failed to delete childborn visit:', e);
    }
  }
  if (adultVisit) {
    try {
      await endVisit(api, adultVisit);
    } catch (e) {
      console.warn('Failed to delete adultVisit:', e);
    }
  }
});
