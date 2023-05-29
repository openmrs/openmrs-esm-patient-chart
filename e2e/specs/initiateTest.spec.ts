import { test } from '../core';
import { HomePage } from '../pages';
import { expect } from '@playwright/test';

test('should be able to see the active visits', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await expect(page).toHaveTitle('OpenMRS');
});
