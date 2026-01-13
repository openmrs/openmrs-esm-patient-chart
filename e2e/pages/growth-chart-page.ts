import { type Page } from '@playwright/test';

export class GrowthChartPage {
  constructor(readonly page: Page) {}

  readonly growthChartCanvas = () => this.page.locator('.growth-chart-container canvas');
  readonly growthChartTable = () => this.page.getByRole('table', { name: /growth chart data/i });
  readonly emptyStateMessage = () => this.page.getByText(/no growth chart data/i);
  readonly growthChartUnavailableMessage = () =>
    this.page.getByText(/Growth charts are only applicable for children under 5 years of age/i);
  readonly recordBiometricsButton = () => this.page.getByRole('button', { name: /record biometrics/i });

  async goTo(patientUuid: string) {
    await this.page.goto(`/openmrs/spa/patient/${patientUuid}/chart/Growth%20Chart`);
  }
}
