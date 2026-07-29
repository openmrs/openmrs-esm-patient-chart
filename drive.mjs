import { chromium } from '@playwright/test';

const BASE = 'http://localhost:8090/openmrs';
const SHOTS = '/tmp/claude-1000/-home-tendo-OPENMRS-openmrs-esm-patient-chart/b38d4138-5957-425f-b1da-5674944fdcb2/scratchpad/app';
const PATIENT = 'fd3847c0-b531-48f6-902d-bbab75aea8c8';

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
const page = await context.newPage();

// webpack-dev-server paints a full-screen overlay when a proxied dev3 request fails, which then
// swallows every click. It is a dev-server artifact, not app UI, so keep it out of the way.
await page.addInitScript(() => {
  setInterval(() => document.getElementById('webpack-dev-server-client-overlay')?.remove(), 250);
});

const step = async (label, fn) => {
  try {
    await fn();
    console.log(`OK   ${label}`);
  } catch (e) {
    console.log(`FAIL ${label}: ${String(e).split('\n')[0]}`);
    throw e;
  }
};

await step('login', async () => {
  await page.goto(`${BASE}/spa/login`, { waitUntil: 'domcontentloaded' });
  await page.getByLabel(/username/i).fill('admin');
  await page.getByRole('button', { name: /continue/i }).click();
  await page.locator('input#password').fill('Admin123');
  await page.getByRole('button', { name: /log in/i }).click();
  await page.waitForURL(/\/spa\/home/, { timeout: 60000 });
});

await step('open orders dashboard', async () => {
  await page.goto(`${BASE}/spa/patient/${PATIENT}/chart/Orders`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(12000);
});

await step('open lab order form', async () => {
  await page.getByText(/record orders/i).first().click();
  await page.waitForTimeout(6000);
  const basket = page.locator('[data-extension-slot-name="order-basket-slot"]');
  await basket.getByRole('button', { name: /add/i }).nth(1).click();
  await page.waitForTimeout(3000);
  await page.getByRole('searchbox').first().fill('blood urea nitrogen');
  await page.waitForTimeout(4000);
  await page.getByRole('button', { name: /order form/i }).first().click();
  await page.waitForTimeout(3000);
});

await step('set STAT + notify me, then save', async () => {
  await page.getByRole('combobox', { name: /priority/i }).selectOption('STAT');
  await page.getByText('Notify me when resulted', { exact: true }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: /save order/i }).click();
  await page.waitForTimeout(4000);
});

await step('sign and close', async () => {
  await page.getByRole('button', { name: /sign and close/i }).click();
  await page.waitForTimeout(10000);
  await page.screenshot({ path: `${SHOTS}-09-order-placed.png` });
});

await step('enter a result for the order', async () => {
  await page.goto(`${BASE}/spa/patient/${PATIENT}/chart/Orders`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(12000);
  const row = page.getByRole('row').filter({ hasText: /blood urea nitrogen/i }).first();
  await row.getByRole('button', { name: /options/i }).click();
  await page.waitForTimeout(1500);
  await page.getByText(/add results/i).first().click();
  await page.waitForTimeout(8000);
  await page.screenshot({ path: `${SHOTS}-10-results-form.png` });

  const numberInput = page.locator('input[type="number"]').first();
  await numberInput.fill('42');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: /save and close|save/i }).first().click();
  await page.waitForTimeout(12000);
});

await step('bell shows the STAT notification', async () => {
  await page.goto(`${BASE}/spa/patient/${PATIENT}/chart/Orders`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(15000);
  const bell = page.getByRole('button', { name: 'Notifications', exact: true });
  await bell.click();
  await page.waitForTimeout(3000);
  const panel = page.getByRole('dialog', { name: 'Notifications' });
  console.log('PANEL:', (await panel.innerText()).replace(/\n+/g, ' | ').slice(0, 400));
  await page.screenshot({ path: `${SHOTS}-11-bell-populated.png` });
});

await browser.close();
