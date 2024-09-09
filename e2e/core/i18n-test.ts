import { test, expect } from '@playwright/test';

test.describe('i18n Translation Tests - English', () => {
  test('should display the correct translation for the cancel button', async ({ page }) => {
    await page.goto('/');  

    const cancelButton = page.locator('[data-testid="cancel-button"]');

    await expect(cancelButton).toHaveText('Cancel');
  });

  test('should display the correct translation for close this panel', async ({ page }) => {
    await page.goto('/'); 

    const closePanelButton = page.locator('[data-testid="close-panel-button"]');

    await expect(closePanelButton).toHaveText('Close this panel');
  });
  
  test('should display the correct error message title', async ({ page }) => {
    await page.goto('/'); 

    const errorTitle = page.locator('[data-testid="error-title"]');
    
    await expect(errorTitle).toHaveText('There was an error with this form');
  });
});

test.describe('i18n Translation Tests - Confirmation Dialogs', () => {
    test('should display the correct translation for delete question confirmation', async ({ page }) => {
      await page.goto('/'); 
  
      await page.click('[data-testid="delete-question-button"]');
  
      const confirmationMessage = page.locator('[data-testid="delete-question-confirmation"]');
      await expect(confirmationMessage).toHaveText('Are you sure you want to delete this question?');
  
      const explainerText = page.locator('[data-testid="delete-question-explainer"]');
      await expect(explainerText).toHaveText('This action cannot be undone.');
    });
  });

test.describe('i18n with localStorage', () => {
  test('should load in English based on localStorage', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('i18nextLng', 'en');
    });
    await page.goto('/');

    const cancelButton = page.locator('[data-testid="cancel-button"]');
    await expect(cancelButton).toHaveText('Cancel');
  });
});
