import { type Page } from '@playwright/test';

export class ProceduresPage {
  constructor(readonly page: Page) {}

  readonly proceduresTable = () => this.page.getByRole('table');

  async goTo(uuid: string) {
    await this.page.goto(`/openmrs/spa/patient/${uuid}/chart/procedures`);
  }
}
