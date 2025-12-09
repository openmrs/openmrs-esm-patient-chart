import { expect } from '@playwright/test';
import { test } from '../core';
import { ChartPage } from '../pages';

test('Start and end a new visit', async ({ page, patient, api }) => {
  await test.step('Ensure no active visits for the patient', async () => {
    const res = await api.get(`visit?patient=${patient.uuid}&active=true`);
    const data = await res.json();
    const { results: visits = [] } = data;

    for (const visit of visits) {
      await api.post(`visit/${visit.uuid}`, { data: { voided: true } });
    }
  });

  const chartPage = new ChartPage(page);

  await test.step('When I visit the chart summary page', async () => {
    await chartPage.goTo(patient.uuid);
  });

  await test.step('And I click on the `Add visit` button in the actions overflow menu', async () => {
    await chartPage.page.getByRole('button', { name: /actions/i }).click();
    await chartPage.page.getByRole('menuitem', { name: /add visit/i }).click();
  });

  await test.step('Then I should see the `Start Visit` form launch in the workspace', async () => {
    await expect(chartPage.page.getByRole('tab', { name: /new/i })).toBeVisible();
    await expect(chartPage.page.getByRole('tab', { name: /ongoing/i })).toBeVisible();
    await expect(chartPage.page.getByRole('tab', { name: /in the past/i })).toBeVisible();
    await expect(chartPage.page.getByRole('combobox', { name: /select a location/i })).toBeVisible();
    await expect(chartPage.page.getByRole('heading', { name: /visit type/i })).toBeVisible();
    await expect(chartPage.page.getByRole('search', { name: /search for a visit type/i })).toBeVisible();
    await expect(chartPage.page.getByLabel(/Facility Visit/i)).toBeVisible();
    await expect(chartPage.page.getByLabel(/Home Visit/i)).toBeVisible();
    await expect(chartPage.page.getByLabel(/OPD Visit/i)).toBeVisible();
    await expect(chartPage.page.getByLabel(/Offline Visit/i)).toBeVisible();
    await expect(chartPage.page.getByLabel(/Group Session/i)).toBeVisible();
    await expect(chartPage.page.getByRole('button', { name: /discard/i })).toBeVisible();
    await expect(chartPage.page.locator('form').getByRole('button', { name: /start visit/i })).toBeVisible();
  });

  await test.step('When I select visit status: Ongoing', async () => {
    await chartPage.page.getByRole('tab', { name: /ongoing/i }).click();
  });
  await test.step('Then I should see Start date and time picker', async () => {
    // FIXME: make the date input work
    // await expect(chartPage.page.getByRole('textbox', { name: /start date/i })).toBeVisible();
    await expect(chartPage.page.getByRole('textbox', { name: /start time/i })).toBeVisible();
    await expect(chartPage.page.getByLabel(/start time format/i)).toBeVisible();
  });

  await test.step('When I select visit status: In the past', async () => {
    await chartPage.page.getByRole('tab', { name: /in the past/i }).click();
  });
  await test.step('Then I should see Start date and time picker AND End date and time picker', async () => {
    // FIXME: make the date input work
    // await expect(chartPage.page.getByRole('textbox', { name: /start date/i })).toBeVisible();
    await expect(chartPage.page.getByRole('textbox', { name: /start time/i })).toBeVisible();
    await expect(chartPage.page.getByLabel(/start time format/i)).toBeVisible();
    // FIXME: make the date input work
    // await expect(chartPage.page.getByRole('textbox', { name: /end date/i })).toBeVisible();
    await expect(chartPage.page.getByRole('textbox', { name: /end time/i })).toBeVisible();
    await expect(chartPage.page.getByLabel(/end time format/i)).toBeVisible();
  });

  await test.step('When I select visit status: new', async () => {
    await chartPage.page.getByRole('tab', { name: /new/i }).click();
  });

  await test.step('And I select the visit type: `OPD Visit`', async () => {
    const opdVisitRadio = chartPage.page.getByLabel(/^OPD Visit$/i);
    await expect(opdVisitRadio).toBeVisible();
    await opdVisitRadio.click();
    await expect(opdVisitRadio).toBeChecked();
  });

  await test.step('And I click on the `Start Visit` button', async () => {
    await chartPage.page
      .locator('form')
      .getByRole('button', { name: /start visit/i })
      .click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(chartPage.page.getByText(/opd visit started successfully/i)).toBeVisible();
  });

  await test.step('And I should see the Active Visit tag on the patient header', async () => {
    await expect(chartPage.page.getByLabel(/active visit/i)).toBeVisible();
  });

  await test.step('When I click on the `End visit` button in the actions overflow menu', async () => {
    await chartPage.page.getByRole('button', { name: /actions/i }).click();
    await chartPage.page.getByRole('menuitem', { name: /end active visit/i }).click();
  });

  await test.step('Then I should see a confirmation modal', async () => {
    await expect(chartPage.page.getByText(/are you sure you want to end this active visit?/i)).toBeVisible();
  });

  await test.step('When I click on the `End Visit` button to confirm', async () => {
    await chartPage.page.getByRole('button', { name: 'danger End Visit' }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(chartPage.page.getByText(/ended current visit successfully/i)).toBeVisible();
  });
});

test('Verify visit context when starting / ending / deleting / restoring active visit', async ({
  page,
  patient,
  api,
}) => {
  await test.step('Ensure no active visits for the patient', async () => {
    const res = await api.get(`visit?patient=${patient.uuid}&active=true`);
    const data = await res.json();
    const { results: visits = [] } = data;

    for (const visit of visits) {
      await api.post(`visit/${visit.uuid}`, { data: { voided: true } });
    }
  });

  const chartPage = new ChartPage(page);

  await test.step('When I visit the chart summary page', async () => {
    await chartPage.goTo(patient.uuid);
  });

  await test.step('When I click the `Visit note` button on the siderail with no visit', async () => {
    await page.getByRole('button', { name: /note/i }).click();
  });

  await test.step('Then I should see a modal to prompt for starting a visit', async () => {
    await expect(chartPage.page.getByText(/no active visit/i)).toBeVisible();
    await expect(chartPage.page.getByRole('button', { name: /cancel/i })).toBeVisible();
    await expect(chartPage.page.getByRole('button', { name: /start new visit/i })).toBeVisible();
  });

  await test.step('When I cancel the start visit prompt modal', async () => {
    await chartPage.page.getByRole('button', { name: /cancel/i }).click();
  });

  await test.step('Then the prompt modal should close', async () => {
    await expect(chartPage.page.getByText(/no active visit/i)).toBeHidden();
    await expect(chartPage.page.getByRole('button', { name: /cancel/i })).toBeHidden();
    await expect(chartPage.page.getByRole('button', { name: /start new visit/i })).toBeHidden();
  });

  await test.step('When I click the `Visit note` button on the siderail again with no visit', async () => {
    await page.getByRole('button', { name: /note/i }).click();
  });

  await test.step("And I click the 'start new visit' button in the prompt modal ", async () => {
    await chartPage.page.getByRole('button', { name: /start new visit/i }).click();
  });

  await test.step('Then I should see the `Start Visit` form launch in the workspace', async () => {
    await expect(chartPage.page.getByRole('tab', { name: /new/i })).toBeVisible();
    await expect(chartPage.page.getByRole('tab', { name: /ongoing/i })).toBeVisible();
    await expect(chartPage.page.getByRole('tab', { name: /in the past/i })).toBeVisible();
  });

  await test.step('When I select visit status: new', async () => {
    await chartPage.page.getByRole('tab', { name: /new/i }).click();
  });

  await test.step('And I select the visit type: `OPD Visit`', async () => {
    const opdVisitRadio = chartPage.page.getByLabel(/^OPD Visit$/i);
    await expect(opdVisitRadio).toBeVisible();
    await opdVisitRadio.click();
    await expect(opdVisitRadio).toBeChecked();
  });

  await test.step('And I click on the `Start Visit` button', async () => {
    await chartPage.page
      .locator('form')
      .getByRole('button', { name: /start visit/i })
      .click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(chartPage.page.getByText(/opd visit started successfully/i)).toBeVisible();
  });

  await test.step('And I should see the Active Visit tag on the patient header', async () => {
    await expect(chartPage.page.getByLabel(/active visit/i)).toBeVisible();
  });

  await test.step('When I click the patient header action menu', async () => {
    await page.getByRole('button', { name: 'Actions' }).click();
  });

  await test.step('And I click on he "Delete active visit", button', async () => {
    await page.getByRole('menuitem', { name: 'Delete active visit' }).click();
  });

  await test.step('Then I should see the confirmation dialog', async () => {
    await expect(page.getByRole('heading', { name: 'Are you sure you want to delete this visit' })).toBeVisible();
  });

  await test.step('When I click on the "Delete visit" button', async () => {
    await page.getByRole('button', { name: 'danger Delete visit' }).click();
  });

  await test.step('Then I should see a confirmation toast and active visit tag removed', async () => {
    await expect(chartPage.page.getByText(/opd visit deleted successfully/i)).toBeVisible();
    await expect(chartPage.page.getByLabel(/active visit/i)).toBeHidden();
  });

  await test.step('When I undo the delete visit', async () => {
    await page.getByRole('button', { name: 'Undo' }).click();
  });

  await test.step('Then I should see the Active Visit tag on the patient header again', async () => {
    await expect(chartPage.page.getByLabel(/active visit/i)).toBeVisible();
  });

  await test.step('When I click the `Visit note` button on the siderail', async () => {
    await page.getByRole('button', { name: /note/i }).click();
  });

  await test.step('Then I should see the visit note form launch in the workspace', async () => {
    await expect(page.getByText('Visit Note', { exact: true })).toBeVisible();
  });

  await test.step('When I close the workspace', async () => {
    await page.getByRole('button', { name: /discard/i }).click();
  });

  await test.step('And I end the active visit', async () => {
    await chartPage.page.getByRole('button', { name: /actions/i }).click();
    await chartPage.page.getByRole('menuitem', { name: /end active visit/i }).click();
    await chartPage.page.getByRole('button', { name: /end visit/i }).click();
  });

  await test.step('Then I should not see the Active Visit tag on the patient header', async () => {
    await expect(chartPage.page.getByLabel(/active visit/i)).toBeHidden();
  });

  await test.step('When I click the `Visit note` button on the siderail', async () => {
    await page.getByRole('button', { name: /note/i }).click();
  });

  await test.step('Then I should see a modal to prompt for starting a visit', async () => {
    await expect(chartPage.page.getByText(/no active visit/i)).toBeVisible();
    await expect(chartPage.page.getByRole('button', { name: /cancel/i })).toBeVisible();
    await expect(chartPage.page.getByRole('button', { name: /start new visit/i })).toBeVisible();
  });
});
