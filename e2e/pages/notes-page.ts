import { Page } from '@playwright/test';

export class NotesPage {
  constructor(readonly page: Page) {}

  readonly tableRow = () => this.page.locator('tr');
  readonly startVisitButton = () => this.page.getByRole('button', { name: 'Start a visit' });
  readonly visitType = () => this.page.getByText('Facility Visit');
  readonly submitButton = () => this.page.locator('form').getByRole('button', { name: 'Start a visit' });

  async goto(patientUuid: string) {
    await this.page.goto(`openmrs/spa/patient/${patientUuid}/chart/Forms%20%26%20Notes`);
  }

  async startVisit() {
    await this.startVisitButton().click();
    await this.visitType().click();
    await this.submitButton().click();
  }
}
