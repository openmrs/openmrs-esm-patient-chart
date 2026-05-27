import { type Page } from '@playwright/test';

export class ProceduresPage {
  constructor(readonly page: Page) {}

  readonly proceduresTable = () => this.page.getByRole('table', { name: /procedures summary/i });

  async goTo(uuid: string) {
    await this.page.goto(`/openmrs/spa/patient/${uuid}/chart/procedures`);
  }
}
