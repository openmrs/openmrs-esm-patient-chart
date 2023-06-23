import { Page } from '@playwright/test';

export class AllergiesPage {
  constructor(readonly page: Page) {}

  readonly tableRow = () => this.page.locator('tr');
  async goto(uuid: string) {
    await this.page.goto('/openmrs/spa/patient/' + uuid + '/chart/Allergies');
  }
}
