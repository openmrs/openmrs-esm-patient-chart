import { expect } from '@playwright/test';
import { test } from '../core';
import { VisitsPage } from '../pages';
import { getVisit } from '../commands';

test('Delete a visit from the visit history table', async ({ page, api, patient, visit }) => {
  const visitsPage = new VisitsPage(page);

  await test.step('When I navigate to the visit history table', async () => {
    await visitsPage.goTo(patient.uuid);
  });

  await test.step('Then I should see the visit in the table', async () => {
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText(/facility visit/i)).toBeVisible();
  });

  await test.step('When I click the delete button on the visit row', async () => {
    await page.getByRole('button', { name: /delete/i }).click();
  });

  await test.step('Then I should see the delete visit confirmation modal', async () => {
    await expect(page.getByRole('heading', { name: /are you sure you want to delete this visit/i })).toBeVisible();
    await expect(page.getByText(/deleting this facility visit will delete its associated encounters/i)).toBeVisible();
  });

  await test.step('When I click on the "Delete visit" button to confirm', async () => {
    await page.getByRole('button', { name: 'danger Delete visit' }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/facility visit deleted successfully/i)).toBeVisible();
  });

  await test.step('And the visit should be voided', async () => {
    const deletedVisit = await getVisit(api, visit.uuid);
    expect(deletedVisit.voided).toBeTruthy();
  });

  await test.step('When I click the undo button', async () => {
    await page.getByRole('button', { name: /undo/i }).click();
  });

  await test.step('Then the visit should be restored', async () => {
    await expect(page.getByText(/facility visit restored successfully/i)).toBeVisible();
    const restoredVisit = await getVisit(api, visit.uuid);
    expect(restoredVisit.voided).toBeFalsy();
  });
});
