import { type Page } from '@playwright/test';

export class ProgramsPage {
  constructor(readonly page: Page) {}

  readonly programsTable = () => this.page.getByRole('table', { name: /program enrollments/i });
  readonly overflowButton = () => this.page.getByRole('button', { name: /edit or delete program/i });
  readonly editProgramButton = () => this.page.getByRole('menuitem', { name: /edit/i });

  async goTo(patientUuid: string) {
    await this.page.goto(`patient/${patientUuid}/chart/programs`);
  }
}
