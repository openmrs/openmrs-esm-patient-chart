import { Page } from '@playwright/test';

export class AllergiesPage {
  constructor(readonly page: Page) {}

  readonly addAllergyButton = () => this.page.getByText('Record');
  readonly drugAllergenOption = () => this.page.getByText('ACE inhibitors');
  readonly reactionOption = () => this.page.getByText('Mental status change');
  readonly severityOption = () => this.page.getByText('Severe');
  readonly allergySummary = () => this.page.locator('td');
  readonly submitButton = () => this.page.getByText('Save');
  async goto(uuid: string) {
    await this.page.goto('/openmrs/spa/patient/' + uuid + '/chart/Allergies');
  }
  async addAllergy() {
    await this.addAllergyButton().click();
    await this.drugAllergenOption().click();
    await this.reactionOption().click();
    await this.severityOption().click();
    await this.submitButton().click();
  }
}
