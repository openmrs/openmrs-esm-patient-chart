import { type Page } from '@playwright/test';

export class ImmunizationsPage {
  constructor(readonly page: Page) {}
  readonly immunizationsTable = () => this.page.getByRole('table', { name: /immunizations summary/i });

  async goTo(patientUuid: string) {
    await this.page.goto(`/openmrs/spa/patient/${patientUuid}/chart/Immunizations`);
  }
}
