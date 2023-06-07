import { Page } from '@playwright/test';

export class PatientAllergiesPage {
  constructor(readonly page: Page) {}

  async goto(uuid: string) {
    await this.page.goto('/openmrs/spa/patient/' + uuid + '/chart/Allergies');
  }
}
