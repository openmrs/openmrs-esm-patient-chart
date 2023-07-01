import { Locator, Page } from '@playwright/test';

export class ProgramPage {
  constructor(readonly page: Page) {}
  readonly tableRow = () => this.page.locator('tr');

  async goto(patientUuid: string) {
    await this.page.goto(`patient/${patientUuid}/chart/Programs`);
  }
}
