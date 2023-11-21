import { Page } from '@playwright/test';

export class ConditionsPage {
  constructor(readonly page: Page) {}

  readonly conditionsTable = () => this.page.locator('tbody');

  async goTo(uuid: string) {
    await this.page.goto(`/openmrs/spa/patient/${uuid}/chart/Conditions`);
  }
}
