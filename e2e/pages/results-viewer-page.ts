import { type Page } from '@playwright/test';

export class ResultsViewerPage {
  constructor(readonly page: Page) {}

  async goTo(patientUuid: string) {
    await this.page.goto('/openmrs/spa/patient/' + patientUuid + '/chart/Results%20Viewer');
  }
}
