import { expect } from '@playwright/test';
import { test } from '../core';
import { AttachmentsPage } from '../pages';

test('Add and remove an attachment', async ({ page, patient }) => {
  const attachmentsPage = new AttachmentsPage(page);
  const filePath = './e2e/support/upload/brainScan.jpeg';
  const displayedFileName = 'brainScan';

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
    await page.locator('input[type="file"]').setInputFiles(filePath);
  });

  await test.step('And I verify the image name field is pre-filled', async () => {
    const imageNameField = page.getByLabel(/image name/i);
    await expect(imageNameField).toBeVisible();
    await expect(imageNameField).toHaveValue(/brainScan/i);
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

  await test.step('When I click on the `Close` button to close the upload status modal', async () => {
    await page
      .locator('button')
      .filter({ hasText: /^Close$/ })
      .click();
  });

  await test.step('Then I should see the file I uploaded displayed in the attachments grid', async () => {
    await expect(page.locator('[role="progressbar"]')).toBeHidden({ timeout: 5000 });
    await expect(page.getByText(displayedFileName, { exact: true })).toBeVisible();
  });

  await test.step('When I click on the uploaded attachment thumbnail in grid view', async () => {
    await page.getByRole('img', { name: displayedFileName }).click();
  });

  await test.step('Then I should see the attachment preview modal open', async () => {
    await expect(page.getByRole('button', { name: /close preview/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: displayedFileName })).toBeVisible();
  });

  await test.step('And I should see the exact filename displayed in the preview', async () => {
    await expect(page.getByRole('heading', { name: displayedFileName })).toBeVisible();
  });

  await test.step('And I should see the description displayed in the preview', async () => {
    await expect(page.getByText(/this is a brain scan image of the patient/i)).toBeVisible();
  });

  await test.step('When I click the close preview button', async () => {
    await page.getByRole('button', { name: /close preview/i }).click();
  });

  await test.step('Then the preview modal should close', async () => {
    await expect(page.getByRole('button', { name: /close preview/i })).toBeHidden();
  });

  await test.step('When I click on the `Table view` tab', async () => {
    await page.getByLabel(/table view/i).click();
  });

  await test.step('And I click on the filename button in the table', async () => {
    await expect(page.getByRole('button', { name: displayedFileName })).toBeVisible();
    await page.getByRole('button', { name: displayedFileName }).click();
  });

  await test.step('Then I should see the attachment preview modal open again', async () => {
    await expect(page.getByRole('button', { name: /close preview/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: displayedFileName })).toBeVisible();
  });

  await test.step('When I press the Escape key', async () => {
    await page.keyboard.press('Escape');
  });

  await test.step('Then the preview modal should close', async () => {
    await expect(page.getByRole('button', { name: /close preview/i })).toBeHidden();
  });

  await test.step('And I click on the delete button in the table row', async () => {
    await page
      .getByRole('button', { name: /delete/i })
      .first()
      .click();
  });

  await test.step('And I confirm the deletion in the modal', async () => {
    await page.getByRole('button', { name: /^danger delete$/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/file deleted/i)).toBeVisible();
  });

  await test.step('And I should not see the deleted attachment in the list', async () => {
    await expect(page.getByRole('button', { name: displayedFileName })).toBeHidden();
    await expect(page.getByText(displayedFileName, { exact: true })).toBeHidden();
  });

  await test.step('And the attachments table should be empty', async () => {
    await expect(page.getByText(/there are no attachments to display for this patient/i)).toBeVisible();
  });
});

test('Upload and preview a PDF attachment', async ({ page, patient }) => {
  const attachmentsPage = new AttachmentsPage(page);
  const filePath = './e2e/support/upload/test-document.pdf';
  const displayedFileName = 'test-document';

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

  await test.step('And I choose the PDF file to upload', async () => {
    await page.locator('input[type="file"]').setInputFiles(filePath);
  });

  await test.step('And I verify the file name field is pre-filled', async () => {
    const fileNameField = page.getByLabel(/file name/i);
    await expect(fileNameField).toBeVisible();
    await expect(fileNameField).toHaveValue(/test-document/i);
  });

  await test.step('And I verify that description field is not shown for PDF files', async () => {
    await expect(page.getByLabel(/image description/i)).toBeHidden();
  });

  await test.step('And I click on the `Add Attachment` button', async () => {
    await page.getByRole('button', { name: /add attachment/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/upload complete/i)).toBeVisible();
  });

  await test.step('When I click on the `Close` button to close the upload status modal', async () => {
    await page
      .locator('button')
      .filter({ hasText: /^Close$/ })
      .click();
  });

  await test.step('Then I should see the PDF file displayed in the attachments grid', async () => {
    await expect(page.getByText(displayedFileName, { exact: true })).toBeVisible();
  });

  await test.step('When I click on the PDF thumbnail in grid view', async () => {
    const fileNameText = page.getByText(displayedFileName, { exact: true });
    const container = fileNameText.locator('..');
    const pdfThumbnail = container.locator('[role="button"]').first();
    await pdfThumbnail.click();
  });

  await test.step('Then I should see the PDF preview modal open', async () => {
    await expect(page.locator('iframe[title="PDFViewer"]')).toBeVisible();
  });

  await test.step('And I should see the exact PDF filename displayed in the preview', async () => {
    await expect(page.getByRole('heading', { name: displayedFileName })).toBeVisible();
  });

  await test.step('And I should verify that no description is shown (PDFs do not have descriptions)', async () => {
    await expect(page.getByLabel(/image description/i)).toBeHidden();
  });

  await test.step('And the preview should have a delete option in the overflow menu', async () => {
    await page.getByRole('button', { name: /attachment actions/i }).click();
    await expect(page.getByText(/delete pdf/i)).toBeVisible();
    await page.keyboard.press('Escape');
  });

  await test.step('When I click the close preview button', async () => {
    await page.getByRole('button', { name: /close preview/i }).click();
  });

  await test.step('Then the preview modal should close', async () => {
    await expect(page.getByRole('button', { name: /close preview/i })).toBeHidden();
  });

  await test.step('When I click on the `Table view` tab', async () => {
    await page.getByLabel(/table view/i).click();
  });

  await test.step('And I click on the PDF filename button in the table', async () => {
    await expect(page.getByRole('button', { name: displayedFileName })).toBeVisible();
    await page.getByRole('button', { name: displayedFileName }).click();
  });

  await test.step('Then I should see the PDF preview modal open again', async () => {
    await expect(page.locator('iframe[title="PDFViewer"]')).toBeVisible();
  });

  await test.step('When I press the Escape key', async () => {
    await page.keyboard.press('Escape');
  });

  await test.step('Then the preview modal should close', async () => {
    await expect(page.getByRole('button', { name: /close preview/i })).toBeHidden();
  });
});

test('The `Add attachment` submit control stays reachable on a small mobile viewport', async ({ page, patient }) => {
  const attachmentsPage = new AttachmentsPage(page);
  const filePath = './e2e/support/upload/brainScan.jpeg';

  // A small mobile-width, short-height viewport approximates a phone screen with the
  // on-screen keyboard open (which shrinks the visible viewport height without resizing
  // the underlying layout on some Android browsers) - see spec.md User Story 1.
  await page.setViewportSize({ width: 375, height: 400 });

  await test.step('When I go to the Attachments page on a small mobile viewport', async () => {
    await attachmentsPage.goTo(patient.uuid);
  });

  await test.step('And I click on the `Record attachments` link', async () => {
    await page.getByRole('button', { name: /record attachments/i }).click();
  });

  await test.step('And I choose the attachment file to upload', async () => {
    await page.getByRole('tab', { name: /upload files/i }).click();
    await page.locator('input[type="file"]').setInputFiles(filePath);
  });

  await test.step('And I focus the image name field, simulating the on-screen keyboard opening', async () => {
    await page.getByLabel(/image name/i).click();
  });

  await test.step('Then the `Add attachment` submit button is visible without scrolling', async () => {
    const submitButton = page.getByRole('button', { name: /add attachment/i });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeInViewport();
  });

  await test.step('And clicking it completes the upload', async () => {
    await page.getByRole('button', { name: /add attachment/i }).click();
    await expect(page.getByText(/upload complete/i)).toBeVisible();
  });
});
