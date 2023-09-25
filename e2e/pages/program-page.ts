import { Locator, Page } from '@playwright/test';

export class ProgramPage {
  constructor(readonly page: Page) {}

  readonly table = () => this.page.getByTestId('program-table');
  readonly editButton = () => this.page.getByTestId('edit-program-button');

  async goto(patientUuid: string) {
    await this.page.goto(`patient/${patientUuid}/chart/Programs`);
  }
}
