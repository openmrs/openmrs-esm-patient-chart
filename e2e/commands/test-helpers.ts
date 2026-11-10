import { expect, type Locator, type Page } from '@playwright/test';
import { ResultsViewerPage } from '../pages/results-viewer-page';

export async function getAfterContent(element: Locator): Promise<string> {
  return await element.evaluate((el) => {
    const after = window.getComputedStyle(el, '::after');
    return after.content;
  });
}

export async function getBackgroundColor(element: Locator): Promise<string> {
  return await element.evaluate((el) => window.getComputedStyle(el).backgroundColor);
}

type ColorProperty = 'backgroundColor' | 'color';

function parseOpaqueRgb(color: string): [number, number, number] {
  if (!/^rgba?\(/i.test(color)) {
    throw new Error(`Unsupported computed color format: ${color}`);
  }

  const components = color
    .slice(color.indexOf('(') + 1, -1)
    .replace('/', ' ')
    .split(/[\s,]+/)
    .filter(Boolean);

  if (components.length < 3 || components.slice(0, 3).some((component) => component.endsWith('%'))) {
    throw new Error(`Unsupported computed color format: ${color}`);
  }

  const [red, green, blue] = components.slice(0, 3).map(Number);
  const alphaComponent = components[3];
  const alpha = alphaComponent
    ? alphaComponent.endsWith('%')
      ? Number(alphaComponent.slice(0, -1)) / 100
      : Number(alphaComponent)
    : 1;

  if ([red, green, blue, alpha].some((component) => !Number.isFinite(component))) {
    throw new Error(`Unsupported computed color format: ${color}`);
  }

  if (alpha !== 1) {
    throw new Error(`Cannot calculate contrast for a non-opaque computed color: ${color}`);
  }

  return [red, green, blue];
}

function relativeLuminance([red, green, blue]: [number, number, number]): number {
  return [red, green, blue]
    .map((value) => value / 255)
    .map((value) => (value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)))
    .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
}

async function getContrastRatio(
  firstElement: Locator,
  secondElement: Locator,
  firstProperty: ColorProperty,
  secondProperty: ColorProperty,
): Promise<number> {
  const [firstColor, secondColor] = await Promise.all([
    firstElement.evaluate((element, property) => window.getComputedStyle(element)[property], firstProperty),
    secondElement.evaluate((element, property) => window.getComputedStyle(element)[property], secondProperty),
  ]);
  const [lighter, darker] = [
    relativeLuminance(parseOpaqueRgb(firstColor)),
    relativeLuminance(parseOpaqueRgb(secondColor)),
  ].sort((first, second) => second - first);

  return (lighter + 0.05) / (darker + 0.05);
}

export async function getTextContrastRatio(text: Locator, surface: Locator): Promise<number> {
  return getContrastRatio(text, surface, 'color', 'backgroundColor');
}

export async function getBackgroundContrastRatio(element: Locator, surface: Locator): Promise<number> {
  return getContrastRatio(element, surface, 'backgroundColor', 'backgroundColor');
}

// Background color + trailing ↑/↓ indicator the vitals table renders for each interpretation level
// (the NumericObservation `cell` variant in @openmrs/esm-styleguide). The indicator is emitted as CSS
// `::after` content, which the browser also folds into the cell's accessible name — so the same string
// both locates the cell by role/name and is asserted as the `::after` content.
export const interpretationCellStyles = {
  normal: { backgroundColor: 'rgba(0, 0, 0, 0)', indicator: '' },
  high: { backgroundColor: 'rgb(255, 242, 232)', indicator: ' ↑' },
  low: { backgroundColor: 'rgb(255, 242, 232)', indicator: ' ↓' },
  critically_high: { backgroundColor: 'rgb(255, 215, 217)', indicator: ' ↑↑' },
  critically_low: { backgroundColor: 'rgb(255, 215, 217)', indicator: ' ↓↓' },
} as const;

export type VitalInterpretation = keyof typeof interpretationCellStyles;

// Asserts that the vitals-table cell displaying `displayValue` (e.g. `38.5` or `145 / 100`) is styled
// for the given interpretation. The colored background and the indicator live on the inner `div`
// rendered by NumericObservation, so the styling is read from there. The accessible name is matched
// exactly: an unflagged cell's name is just its value, which would otherwise substring-match the
// blood-pressure cell (`100` in `100 / 60`) or the timestamp cell (`25` in a `10:25` time).
export async function expectCellInterpretation(
  page: Page,
  displayValue: string,
  interpretation: VitalInterpretation,
): Promise<void> {
  const { backgroundColor, indicator } = interpretationCellStyles[interpretation];
  const styledContent = page
    .getByRole('cell', { name: `${displayValue}${indicator}`, exact: true })
    .locator('div')
    .first();

  expect(await getBackgroundColor(styledContent)).toBe(backgroundColor);
  expect(await getAfterContent(styledContent)).toBe(interpretation === 'normal' ? 'none' : `"${indicator}"`);
}

// Verifies a saved lab result for `conceptName` with `value` is visible in the patient's Results
// Viewer under the "Individual tests" tab. Shared by the lab-orders and lab-app-results specs, which
// both finish by confirming the entered result actually persisted and renders. The row is matched on
// both the concept name and the value so a stale or empty row cannot satisfy it.
export async function expectLabResultInResultsViewer(
  page: Page,
  patientUuid: string,
  conceptName: string,
  value: string,
): Promise<void> {
  const resultsViewerPage = new ResultsViewerPage(page);
  await resultsViewerPage.goTo(patientUuid);
  await page.getByRole('tab', { name: /individual tests/i }).click();
  const row = page.getByRole('row').filter({ hasText: conceptName }).filter({ hasText: value }).first();
  await expect(row).toBeVisible();
}

export async function calculateBirthdate(age: { years?: number; months?: number }): Promise<string> {
  const date = new Date();
  date.setDate(1); // Use day 1 to avoid month rollover (e.g. Mar 31 - 1 month → Feb 31 → Mar 3)

  if (age.years) date.setFullYear(date.getFullYear() - age.years);
  if (age.months) date.setMonth(date.getMonth() - age.months);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${year}-${month}-01`;
}
