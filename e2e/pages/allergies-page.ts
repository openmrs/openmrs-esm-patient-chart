import { Page } from '@playwright/test';

export class PatientAllergiesPage {
  constructor(readonly page: Page) {}

  readonly allergiesTable = () => this.page.getByRole('table', { name: /allergies summary/i });

  async goTo(uuid: string) {
    await this.page.goto('/openmrs/spa/patient/' + uuid + '/chart/Allergies');
  }
}
