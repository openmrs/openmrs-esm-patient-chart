import { type Page, expect } from '@playwright/test';

export class MarkPatientDeceasedPage {
  constructor(private readonly page: Page) {}

  // Navigate to the patient's chart page
  async goToPatientChart(patientUuid: string) {
    await this.page.goto(`/openmrs/spa/patient/${patientUuid}/chart/Patient%20Summary`);
  }

  // Open the "Mark Patient Deceased" form
  async openMarkDeceasedForm() {
    await this.page.locator('button', { hasText: /actions/i }).click();
    await this.page.locator('role=menuitem', { hasText: /mark patient deceased/i }).click();
  }

  // Fill out the details in the "Mark Patient Deceased" form
  async fillDeathDetails(date: string, causeOfDeath: string) {
    await this.page.fill('input[placeholder="dd/mm/yyyy"]', date);
    await this.page.locator(`role=radio[name="${causeOfDeath}"]`).click();
  }

  // Save and close the "Mark Patient Deceased" form
  async saveAndClose() {
    await this.page.locator('button', { hasText: /save and close/i }).click();
  }

  // Verify that the deceased tag is visible on the page
  async verifyDeceasedTag() {
    await expect(this.page.locator('text=deceased')).toBeVisible();
  }
}
