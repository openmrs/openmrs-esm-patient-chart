import { test, expect } from '@playwright/test';
import { MarkPatientDeceasedPage } from '../pages/mark-patient-deceased-page';

test.describe('Mark Patient Deceased', () => {
  const patientUuid = 'e5a00ecf-4caa-423d-9321-31e7efccb133'; // Example patient UUID
  const todayDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-'); // Format: DD-MM-YYYY
  const causeOfDeath = 'Neoplasm';

  test('should mark patient as deceased and display deceased tag', async ({ page }) => {
    const markPatientDeceasedPage = new MarkPatientDeceasedPage(page);

    // Given that I have a patient
    // And I am on the Patient’s chart page
    await markPatientDeceasedPage.goToPatientChart(patientUuid);

    // When I click on the "Actions" button
    // And I select "Mark patient deceased"
    await markPatientDeceasedPage.openMarkDeceasedForm();

    // Then I should see a form to enter the patient's death details
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('text=Date of death')).toBeVisible();
    await expect(page.locator('text=Cause of death')).toBeVisible();

    // When I enter the "Date of death" to today’s date
    // And the "Cause of death" to Neoplasm
    // And click "Save and close"
    await markPatientDeceasedPage.fillDeathDetails(todayDate, causeOfDeath);
    await markPatientDeceasedPage.saveAndClose();

    // Then I should see a “deceased” patient tag in the patient banner
    await markPatientDeceasedPage.verifyDeceasedTag();
  });
});
