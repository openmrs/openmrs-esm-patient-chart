import { expect } from '@playwright/test';
import dayjs from 'dayjs';
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
    // The deceased header renders as a dark grey ($gray-70) band.
    await expect(banner).toHaveCSS('background-color', 'rgb(82, 82, 82)');

    // Expand the contact-details panel, which renders directly on the dark band. Its values must
    // stay readable; before the recolour fix they inherited $text-02 — the same grey as the band
    // (contrast 1.0). Assert WCAG AA contrast between a value and the band.
    await banner.getByRole('button', { name: /show more/i }).click();

    const { valueContrast, minTagContrast, minTagVsBand } = await banner.evaluate((el) => {
      const channels = (color: string) => (color.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number);
      const relativeLuminance = ([r, g, b]: number[]) =>
        [r, g, b]
          .map((v) => v / 255)
          .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)))
          .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
      const contrast = (a: string, b: string) => {
        const [lighter, darker] = [relativeLuminance(channels(a)), relativeLuminance(channels(b))].sort(
          (x, y) => y - x,
        );
        return (lighter + 0.05) / (darker + 0.05);
      };

      // Pick a *visible* contact-details value. The actions overflow-menu also renders <li> items
      // (Carbon OverflowMenuItem) earlier in the DOM, but they stay hidden until the menu opens, so
      // filtering by visibility reliably targets a contact-details value rather than a menu item.
      const value = Array.from(el.querySelectorAll('li')).find(
        (li) => li.offsetParent !== null && (li.textContent ?? '').trim().length > 0,
      );
      if (!value) {
        throw new Error('No visible contact-details value found in the expanded banner');
      }
      const band = getComputedStyle(el).backgroundColor;

      // The other half of the recolour: identifier/status tags (e.g. the OpenMRS ID pill, the
      // Deceased tag) must keep their dark text on their *own* light backgrounds — they are excluded
      // from the recolour, and if that exclusion regresses their label goes light-on-light.
      const tags = Array.from(el.querySelectorAll('[class~="cds--tag"]'));
      if (!tags.length) {
        throw new Error('No identifier/status tag found in the banner');
      }
      const tagContrasts = tags.map((tag) => {
        const label = tag.querySelector('[class*="cds--tag__label"]') ?? tag;
        return contrast(getComputedStyle(tag).backgroundColor, getComputedStyle(label).color);
      });

      return {
        valueContrast: contrast(band, getComputedStyle(value).color),
        minTagContrast: Math.min(...tagContrasts),
        // Whether each tag still reads as a distinct chip against the band — this is what the
        // scoped Deceased-tag lift exists to guarantee (a dark chip would sit ~1.48:1 here).
        minTagVsBand: Math.min(...tags.map((tag) => contrast(getComputedStyle(tag).backgroundColor, band))),
      };
    });

    // Contact-details values read against the dark band, tags stay readable on their own pills, and
    // tags read as distinct chips against the band (WCAG 1.4.11 non-text contrast).
    expect(valueContrast).toBeGreaterThanOrEqual(4.5);
    expect(minTagContrast).toBeGreaterThanOrEqual(4.5);
    expect(minTagVsBand).toBeGreaterThanOrEqual(3);

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
