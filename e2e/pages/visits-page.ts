import { type Page } from '@playwright/test';

export class VisitsPage {
  constructor(readonly page: Page) {}

  async goTo(patientUuid: string) {
    await this.page.goto(`patient/${patientUuid}/chart/Visits`);
  }
}
