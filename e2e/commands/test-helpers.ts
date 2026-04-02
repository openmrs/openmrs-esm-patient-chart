import { type Locator } from '@playwright/test';

export async function getAfterContent(element: Locator): Promise<string> {
  return await element.evaluate((el) => {
    const after = window.getComputedStyle(el, '::after');
    return after.content;
  });
}

export async function getBackgroundColor(element: Locator): Promise<string> {
  return await element.evaluate((el) => window.getComputedStyle(el).backgroundColor);
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
