import { type Page } from '@playwright/test';

export class LaboratoryPage {
  constructor(readonly page: Page) {}

  async goTo() {
    await this.page.goto('/openmrs/spa/home/laboratory');
  }
}
