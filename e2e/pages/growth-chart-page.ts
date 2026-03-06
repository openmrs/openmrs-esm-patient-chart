import { type Page } from '@playwright/test';

export class GrowthChartPage {
  constructor(readonly page: Page) {}

  readonly emptyStateMessage = () => this.page.getByText(/Growth Chart Unavailable/i);
  readonly growthChartUnavailableMessage = () =>
    this.page.getByText(/There are no growth charts to display for this patient/i);

  async goTo(patientUuid: string) {
    await this.page.goto(`/openmrs/spa/patient/${patientUuid}/chart/Growth%20Chart`);
  }
}
