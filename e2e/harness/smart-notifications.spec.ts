import { expect, type Page, test } from '@playwright/test';

/**
 * Drives the smart lab-result notification UI in the screenshot harness.
 *
 * The components are the real ones and the notifications are derived by the shipped classification
 * rule from fixture orders and observations, so these tests exercise behaviour rather than a static
 * mock-up. Every capture is preceded by assertions, so the suite fails on a regression rather than
 * only on a pixel diff. Screenshots land in `e2e/harness/screenshots/`.
 */

const screenshotDir = 'e2e/harness/screenshots';

async function gotoScene(page: Page, query: Record<string, string>) {
  await page.goto(`/?${new URLSearchParams(query)}`);
  // Wait for webfonts so text metrics are stable between runs.
  await page.evaluate(() => document.fonts.ready);
}

function bellOf(page: Page) {
  return page.getByRole('button', { name: 'Notifications', exact: true });
}

function panelOf(page: Page) {
  return page.getByRole('dialog', { name: 'Notifications' });
}

test.describe('notification bell', () => {
  test('badges only the results that need attention, not every result', async ({ page }) => {
    // The `single` fixture has two resulted routine orders; only the opted-in one should count.
    await gotoScene(page, { scenario: 'single' });

    const bell = bellOf(page);
    await expect(bell).toBeVisible();
    await expect(bell.locator('.bellBadge')).toHaveText('1');

    await bell.click();

    const panel = panelOf(page);
    await expect(panel).toBeVisible();
    await expect(panel.getByText('1 notification needs review')).toBeVisible();
    await expect(panel.getByRole('heading', { name: 'Requires attention' })).toBeVisible();

    const row = panel.getByRole('button', { name: /Serum Creatinine/ });
    await expect(row.locator('.priorityTag')).toHaveText('Routine');
    await expect(row).toContainText('Lab result');
    await expect(row).toContainText('Betty Bliss');
    await expect(row).toContainText('Serum Creatinine — 1.1 mg/dL');
    await expect(row).toContainText('Normal · Ref 0.6 – 1.2 mg/dL');

    // The alert-fatigue guarantee: the routine, in-range, non-opted-in result never surfaces.
    await expect(panel.getByText('Serum glucose')).toBeHidden();

    await expect(panel.getByText(/only STAT orders and critical values interrupt you/)).toBeVisible();

    await page.screenshot({ path: `${screenshotDir}/01-bell-and-inbox.png` });
  });

  test('ranks critical above stat above routine', async ({ page }) => {
    await gotoScene(page, { scenario: 'triage' });

    await expect(bellOf(page).locator('.bellBadge')).toHaveText('3');
    await bellOf(page).click();

    const panel = panelOf(page);
    await expect(panel.getByText('3 notifications need review')).toBeVisible();

    // Haemoglobin was ordered routine but came back critically low, so severity wins.
    expect(await panel.locator('.priorityTag').allInnerTexts()).toEqual(['CRITICAL', 'STAT', 'ROUTINE']);
    await expect(panel.getByRole('button', { name: /Haemoglobin/ })).toContainText('Critically low · Ref 12 – 14 g/dL');

    await page.screenshot({ path: `${screenshotDir}/02-inbox-severity-ranking.png` });
  });

  test('shows an empty state when every result filed silently', async ({ page }) => {
    await gotoScene(page, { scenario: 'quiet' });

    await expect(bellOf(page).locator('.bellBadge')).toBeHidden();
    await bellOf(page).click();

    await expect(panelOf(page).getByText('Nothing needs your attention')).toBeVisible();

    await page.screenshot({ path: `${screenshotDir}/03-inbox-empty-state.png` });
  });

  test('closes on Escape', async ({ page }) => {
    await gotoScene(page, { scenario: 'single' });
    await bellOf(page).click();
    await expect(panelOf(page)).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(panelOf(page)).toBeHidden();
  });

  test('does not render outside a patient chart', async ({ page }) => {
    await gotoScene(page, { scenario: 'single', noPatient: '1' });

    await expect(bellOf(page)).toBeHidden();
  });

  test('does not render when the feature is switched off', async ({ page }) => {
    await gotoScene(page, { scenario: 'single', disabled: '1' });

    await expect(bellOf(page)).toBeHidden();
  });
});

test.describe('notification detail dialog', () => {
  test('shows the full result, order and location detail', async ({ page }) => {
    await gotoScene(page, { scenario: 'single' });
    await bellOf(page).click();

    await page.getByRole('button', { name: /Serum Creatinine/ }).click();

    const modal = page.getByRole('dialog', { name: 'Notification detail' });
    await expect(modal).toBeVisible();
    await expect(modal.getByText('Lab result · Just now')).toBeVisible();
    await expect(modal.getByText('Betty Bliss')).toBeVisible();
    await expect(modal.getByText('Female · 26 yrs · OpenMRS ID 100065E')).toBeVisible();
    await expect(modal.getByText('Serum Creatinine', { exact: true })).toBeVisible();
    await expect(modal.getByText('Normal · Ref 0.6 – 1.2 mg/dL')).toBeVisible();
    await expect(modal.getByText('Dr. Sarah Smith')).toBeVisible();
    await expect(modal.getByText('Outpatient Triage · Ubuntu Hospital')).toBeVisible();
    await expect(modal.getByText('Order number ORD-1001')).toBeVisible();

    // Opening the dialog must not dismiss the inbox behind it.
    await expect(panelOf(page)).toBeVisible();

    await page.screenshot({ path: `${screenshotDir}/04-detail-dialog.png` });
  });

  test('"View in chart" navigates to Results and leaves the notification in the inbox', async ({ page }) => {
    await gotoScene(page, { scenario: 'single' });

    const navigations: Array<string> = [];
    await page.exposeFunction('recordNavigation', (to: string) => navigations.push(to));
    await page.evaluate(() =>
      window.addEventListener('harness:navigate', (event) =>
        (window as never as { recordNavigation: (to: string) => void }).recordNavigation((event as CustomEvent).detail),
      ),
    );

    await bellOf(page).click();
    await page.getByRole('button', { name: /Serum Creatinine/ }).click();
    await page.getByRole('button', { name: 'View in chart' }).click();

    expect(navigations).toEqual(['${openmrsSpaBase}/patient/betty-bliss-uuid/chart/results']);
    // A look, not a sign-off.
    await expect(bellOf(page).locator('.bellBadge')).toHaveText('1');
  });

  test('"Mark as reviewed" records the reviewer and drops the count', async ({ page }) => {
    await gotoScene(page, { scenario: 'single' });

    await bellOf(page).click();
    await page.getByRole('button', { name: /Serum Creatinine/ }).click();
    await page.getByRole('button', { name: 'Mark as reviewed' }).click();

    await expect(page.getByRole('dialog', { name: 'Notification detail' })).toBeHidden();
    await expect(bellOf(page).locator('.bellBadge')).toBeHidden();
    await expect(panelOf(page).getByText('Nothing needs your attention')).toBeVisible();

    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('openmrs:smart-notifications:reviewed:user-uuid-1') ?? '{}'),
    );
    expect(stored['order-uuid-creatinine:obs-uuid-creatinine']).toMatchObject({
      providerDisplay: 'Dr. Sarah Smith',
      patientUuid: 'betty-bliss-uuid',
    });
  });

  test('a reviewed result stays gone after a reload', async ({ page }) => {
    await gotoScene(page, { scenario: 'single' });
    await bellOf(page).click();
    await page.getByRole('button', { name: /Serum Creatinine/ }).click();
    await page.getByRole('button', { name: 'Mark as reviewed' }).click();
    await expect(bellOf(page).locator('.bellBadge')).toBeHidden();

    await page.reload();

    await expect(bellOf(page).locator('.bellBadge')).toBeHidden();
  });
});

test.describe('order form opt-in', () => {
  test('renders off by default, with its explanatory callout', async ({ page }) => {
    await gotoScene(page, { scene: 'order-form' });

    const toggle = page.getByRole('switch', { name: /Notify me when resulted/ });
    await expect(toggle).toBeVisible();
    await expect(toggle).not.toBeChecked();
    await expect(page.getByText(/sends you a notification the moment this order is resulted/)).toBeVisible();
    // Priority is Stat here, so the helper text explains what Stat already does for you.
    await expect(page.getByText(/A notification fires the moment results are entered/)).toBeVisible();

    await page.screenshot({ path: `${screenshotDir}/05-order-form-opt-in-off.png` });
  });

  test('turning it on confirms with a snackbar', async ({ page }) => {
    await gotoScene(page, { scene: 'order-form', priority: 'routine' });

    await expect(page.getByText(/filed silently to the chart unless the entered value is critical/)).toBeVisible();

    // Carbon's toggle label overlays the switch, which is what a clinician clicks anyway.
    await page.getByText('Notify me when resulted', { exact: true }).click();

    await expect(page.getByRole('switch', { name: /Notify me when resulted/ })).toBeChecked();
    const snackbar = page.locator('.harnessSnackbar');
    await expect(snackbar).toContainText('Notify when resulted');
    await expect(snackbar).toContainText(/sends you a notification the moment this order is resulted/);

    await page.screenshot({ path: `${screenshotDir}/06-order-form-opt-in-on.png` });
  });

  test('disappears entirely when the feature is switched off', async ({ page }) => {
    await gotoScene(page, { scene: 'order-form' });
    await expect(page.getByRole('switch', { name: /Notify me when resulted/ })).toBeVisible();

    await gotoScene(page, { scene: 'order-form', disabled: '1' });

    await expect(page.getByRole('switch', { name: /Notify me when resulted/ })).toBeHidden();
    await expect(page.getByText(/filed silently to the chart/)).toBeHidden();
  });
});

test.describe('results dashboard', () => {
  test('confirms a reviewed result', async ({ page }) => {
    await gotoScene(page, { scene: 'results-banner' });

    await expect(page.getByText('Result reviewed')).toBeVisible();
    await expect(page.getByText('Reviewed by Dr. Sarah Smith · Just now')).toBeVisible();

    await page.screenshot({ path: `${screenshotDir}/07-results-reviewed-banner.png` });
  });
});
