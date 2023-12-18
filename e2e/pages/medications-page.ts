import { type Page } from '@playwright/test';

export class MedicationsPage {
  constructor(readonly page: Page) {}

  readonly medicationsTable = () => this.page.getByRole('table', { name: /medications/i });

  async goTo(patientUuid: string) {
    await this.page.goto(`/openmrs/spa/patient/${patientUuid}/chart/Medications`);
  }
}
