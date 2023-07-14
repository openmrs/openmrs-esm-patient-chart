import { Page } from '@playwright/test';

export class PatientAllergiesPage {
  constructor(readonly page: Page) {}

  readonly allergyTable = () => this.page.getByTestId('allergy-table');
  readonly tableRow = () => this.page.locator('tr');
  async goto(uuid: string) {
    await this.page.goto('/openmrs/spa/patient/' + uuid + '/chart/Allergies');
  }
}
