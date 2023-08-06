import { Page } from '@playwright/test';

export class BiometricsAndVitalsPage {
  constructor(readonly page: Page) {}

  // readonly vitalsTable = () => this.page.getByTestId('vitals-table');
  // readonly biometricsTable = () => this.page.getByTestId('biometrics-table');
  readonly vitalsTable = () => this.page.getByTestId('vitals-table');
  readonly biometricsTable = () => this.page.locator('tbody');

  async goto(uuid: string) {
    await this.page.goto('/openmrs/spa/patient/' + uuid + '/chart/Vitals%20%26%20Biometrics');
  }
}
