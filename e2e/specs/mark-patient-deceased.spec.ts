import { expect } from '@playwright/test';
import dayjs from 'dayjs';
import { getBackgroundContrastRatio, getTextContrastRatio } from '../commands/test-helpers';
import { test } from '../core';
import { MarkPatientDeceasedPage } from '../pages/mark-patient-deceased-page';

test('Mark a patient as deceased', async ({ page, patient }) => {
  const markPatientDeceasedPage = new MarkPatientDeceasedPage(page);
  const causeOfDeath = 'Neoplasm';
  const actionsButton = () => page.getByRole('button', { name: /actions/i });
  const markDeceasedMenuItem = () => page.getByRole('menuitem', { name: /mark patient deceased/i });
  const deathDetailsForm = () => page.locator('form');
  const dateOfDeathInput = () => page.getByTestId('deceasedDate');

  await test.step('Given that I have a patient and I am on the Patient’s chart page', async () => {
    await markPatientDeceasedPage.goTo(patient.uuid);
  });

  await test.step('When I click on the "Actions" button and select "Mark patient deceased"', async () => {
    await actionsButton().click();
    await markDeceasedMenuItem().click();
  });

  await test.step("Then I should see a form to enter the patient's death details", async () => {
    await expect(deathDetailsForm()).toBeVisible();
    await expect(dateOfDeathInput()).toBeVisible();
    await expect(page.getByRole('radio', { name: causeOfDeath })).toBeVisible();
  });

  await test.step('When I enter the "Date of death" to today’s date', async () => {
    const dateOfDeathDayInput = dateOfDeathInput().getByRole('spinbutton', { name: /day/i });

    const dateOfDeathMonthInput = dateOfDeathInput().getByRole('spinbutton', { name: /month/i });
    const dateOfDeathYearInput = dateOfDeathInput().getByRole('spinbutton', { name: /year/i });
    await dateOfDeathDayInput.fill(dayjs().format('DD'));
    await dateOfDeathMonthInput.fill(dayjs().format('MM'));
    await dateOfDeathYearInput.fill(dayjs().format('YYYY'));
    await page.keyboard.press('Enter');
  });

  await test.step('And the "Cause of death" to Neoplasm', async () => {
    await page.locator('text=Neoplasm').click();
  });

  await test.step('And I click "Save and close"', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a “deceased” patient tag in the patient banner', async () => {
    const deceasedTagLocator = page.locator('[data-extension-id="deceased-patient-tag"] span[title="Deceased"]');
    await expect(deceasedTagLocator).toBeVisible();
  });

  await test.step('And the deceased banner keeps its contact details legible on the dark band', async () => {
    const banner = page.getByRole('banner', { name: /patient banner/i });
    await expect(banner).toHaveCSS('background-color', 'rgb(82, 82, 82)');

    // Expand the contact-details panel, which renders directly on the dark band. Its values must
    // stay readable; before the recolour fix they inherited $text-02 — the same grey as the band
    // (contrast 1.0). Assert WCAG AA contrast between a value and the band.
    await banner.getByRole('button', { name: /show more/i }).click();

    const contactDetails = banner.getByTestId('patient-banner-contact-details');
    const value = contactDetails.locator('li:visible').first();
    await expect(value).toBeVisible();
    const valueContrast = await getTextContrastRatio(value, banner);

    // Check every visible identifier/status tag on the band so new banner tags inherit the same
    // contrast floor without needing a separate assertion.
    const tags = banner.locator('[class~="cds--tag"]:visible');
    await expect(tags.first()).toBeVisible();
    const tagContrasts: number[] = [];
    const tagVsBandContrasts: number[] = [];
    const tagCount = await tags.count();
    for (let index = 0; index < tagCount; index++) {
      const tag = tags.nth(index);
      const tagLabel = tag.locator('[class*="cds--tag__label"]').first();
      tagContrasts.push(await getTextContrastRatio((await tagLabel.count()) > 0 ? tagLabel : tag, tag));
      tagVsBandContrasts.push(await getBackgroundContrastRatio(tag, banner));
    }

    expect(valueContrast).toBeGreaterThanOrEqual(4.5);
    expect(Math.min(...tagContrasts)).toBeGreaterThanOrEqual(4.5);
    expect(Math.min(...tagVsBandContrasts)).toBeGreaterThanOrEqual(3);

    // Carbon draws the Actions trigger's focus ring as an outline and the toggle's as an inset
    // box-shadow, so each needs its own read. The default blue (#0f62fe) is 1.56:1 against this
    // band, below the 3:1 WCAG 1.4.11 wants for non-text contrast.
    const actionsTrigger = banner.getByRole('button', { name: /actions/i });
    await actionsTrigger.focus();
    await expect(actionsTrigger).toHaveCSS('outline-color', 'rgb(255, 255, 255)');

    const showLessToggle = banner.getByRole('button', { name: /show less/i });
    await showLessToggle.focus();
    await expect(showLessToggle).toHaveCSS('box-shadow', /^rgb\(255, 255, 255\)/);
  });
});
