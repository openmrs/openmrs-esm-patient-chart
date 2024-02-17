import { type Page } from '@playwright/test';

export class AppointmentsPage {
  constructor(readonly page: Page) {}

  readonly appointmentsTable = () => this.page.getByRole('table', { name: /appointments/i });

  async goto(uuid: string) {
    await this.page.goto(`/openmrs/spa/patient/${uuid}/chart/Appointments`);
  }
}
