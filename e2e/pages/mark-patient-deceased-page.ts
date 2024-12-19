import { type Page } from '@playwright/test';

export class MarkPatientDeceasedPage {
  constructor(readonly page: Page) {}

  async goTo(patientUuid: string) {
    await this.page.goto('/openmrs/spa/patient/' + patientUuid + '/chart/Patient%20Summary');
  }

}
