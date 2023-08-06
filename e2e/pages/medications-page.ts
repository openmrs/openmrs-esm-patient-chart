import { Page } from '@playwright/test';

export class MedicationsPage {
  constructor(readonly page: Page) {}

  readonly activeMedicationTable = () => this.page.getByTestId('active-medication-table');
  readonly pastMedicationTable = () => this.page.getByTestId('past-medication-table');

  async goto(uuid: string) {
    await this.page.goto(`/openmrs/spa/patient/${uuid}/chart/Medications`);
  }
}
