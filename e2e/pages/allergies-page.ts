import { Page } from '@playwright/test';

export class PatientAllergiesPage {
  constructor(readonly page: Page) {}

  // TODO: Switch to getByRole locators using the provided aria-labels
  readonly allergyTable = () => this.page.getByTestId('allergy-table');

  async goTo(uuid: string) {
    await this.page.goto('/openmrs/spa/patient/' + uuid + '/chart/Allergies');
  }
}
