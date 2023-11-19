import { Page } from '@playwright/test';

export class BiometricsAndVitalsPage {
  constructor(readonly page: Page) {}

  // TODO: Switch to getByRole locators using the provided aria-labels
  readonly vitalsTable = () => this.page.getByTestId('vitals-table');
  readonly biometricsTable = () => this.page.getByTestId('biometrics-table');

  async goTo(uuid: string) {
    await this.page.goto('/openmrs/spa/patient/' + uuid + '/chart/Vitals%20%26%20Biometrics');
  }
}
