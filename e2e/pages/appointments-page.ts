import { type Page } from '@playwright/test';

export class AppointmentsPage {
  constructor(readonly page: Page) {}

  async goto(uuid: string) {
    await this.page.goto(`/openmrs/spa/patient/${uuid}/chart/Appointments`);
  }
}
