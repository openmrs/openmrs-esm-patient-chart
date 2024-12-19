import { type Page } from '@playwright/test';

export class MarkPatientDeceasedPage {
  constructor(private readonly page: Page) {}
  
  async goTo(patientUuid: string) {
    const patientChartPath = `/openmrs/spa/patient/${patientUuid}/chart/Patient%20Summary`;
    await this.page.goto(patientChartPath);
  }
}
