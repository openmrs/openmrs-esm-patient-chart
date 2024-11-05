import { expect } from '@playwright/test';
import { generateRandomPatient, type Patient, deletePatient } from '../commands';
import { test } from '../core';
import { AttachmentsPage } from '../pages';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('Add and remove an attachment', async ({ page }) => {
  const attachmentsPage = new AttachmentsPage(page);
  const filePath = './e2e/support/upload/brainScan.jpeg';

  await test.step('When I go to the Attachments page', async () => {
    await attachmentsPage.goTo(patient.uuid);
  });

  await test.step('And I click on the `Record attachments` link', async () => {
    await page.getByRole('button', { name: /record attachments/i }).click();
  });

  await test.step('Then I should see the `Add attachment` modal launch in the workspace', async () => {
    await expect(page.getByText(/add attachment/i)).toBeVisible();
  });

  await test.step('When I click on the `Upload files` tab', async () => {
    await page.getByRole('tab', { name: /upload files/i }).click();
  });

  await test.step('And I choose the attachment file to upload', async () => {
    await page.on('filechooser', async (fileChooser) => {
      await fileChooser.setFiles(filePath);
    });
    await page.click('.cds--file-browse-btn');
  });

  await test.step('And I add a description for the image to upload', async () => {
    await page.getByLabel(/image description/i).clear();
    await page.getByLabel(/image description/i).fill('This is a brain scan image of the patient');
  });

  await test.step('And I click on the `Add Attachment` button', async () => {
    await page.getByRole('button', { name: /add attachment/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/upload complete/i)).toBeVisible();
  });

  await test.step('When I click on the `Close` button', async () => {
    await page
      .locator('button')
      .filter({ hasText: /^Close$/ })
      .click();
  });

  await test.step('Then I should see the file I uploaded displayed in the attachments table', async () => {
    await expect(page.getByRole('button', { name: /brainScan/i })).toBeVisible();
  });

  await test.step('When I click on the `Table view` tab', async () => {
    await page.getByLabel(/table view/i).click();
  });

  await test.step('And I click the overflow menu in the table row of the uploaded file', async () => {
    await page.getByRole('button', { name: /options/i }).click();
  });

  await test.step('And I click on the `Delete` button', async () => {
    await page.getByRole('menuitem', { name: /delete/i }).click();
    await page.getByRole('button', { name: /delete/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/file deleted/i)).toBeVisible();
  });

  await test.step('And I should not see the deleted attachment in the list', async () => {
    await expect(page.getByRole('button', { name: /brainScan/i })).not.toBeVisible();
  });

  await test.step('And the attachments table should be empty', async () => {
    await expect(page.getByText(/there are no attachments to display for this patient/i)).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
