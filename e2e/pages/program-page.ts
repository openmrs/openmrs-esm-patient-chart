import { Page } from '@playwright/test';

export class ProgramsPage {
  constructor(readonly page: Page) {}

  // TODO: Switch to getByRole locators using the provided aria-labels
  readonly programsTable = () => this.page.getByTestId('program-table');
  readonly editButton = () => this.page.getByTestId('edit-program-button');

  async goTo(patientUuid: string) {
    await this.page.goto(`patient/${patientUuid}/chart/Programs`);
  }
}
