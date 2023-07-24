import { Page } from '@playwright/test';

export class NotesPage {
  constructor(readonly page: Page) {}

  readonly table = () => this.page.locator('tbody');

  async goto(patientUuid: string) {
    await this.page.goto(`openmrs/spa/patient/${patientUuid}/chart/Forms%20%26%20Notes`);
  }
}
