import { type Page } from '@playwright/test';

export class BiometricsAndVitalsPage {
  constructor(readonly page: Page) {}

  readonly biometricsTable = () => this.page.getByRole('table', { name: /biometrics/i });
  readonly vitalsTable = () => this.page.getByRole('table', { name: /vitals/i });

  async goTo(uuid: string) {
    await this.page.goto('/openmrs/spa/patient/' + uuid + '/chart/vitals-and-biometrics');
  }

  readonly vitalsHeader = () => this.vitalsTable().locator('thead > tr');
  readonly vitalsFirstRow = () => this.vitalsTable().locator('tbody > tr').first();
}
