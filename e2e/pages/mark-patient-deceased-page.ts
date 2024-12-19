import { type Page } from '@playwright/test';

export class MarkPatientDeceasedPage {
  constructor(private readonly page: Page) {}

  getPatientChartPath(patientUuid: string): string {
    return `/openmrs/spa/patient/${patientUuid}/chart/Patient%20Summary`;
  }
}
