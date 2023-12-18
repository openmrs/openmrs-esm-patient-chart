import { type Page } from '@playwright/test';

export class BiometricsAndVitalsPage {
  constructor(readonly page: Page) {}

  readonly biometricsTable = () => this.page.getByRole('table', { name: /biometrics/i });
  readonly vitalsTable = () => this.page.getByRole('table', { name: /vitals/i });

  async goTo(uuid: string) {
    await this.page.goto('/openmrs/spa/patient/' + uuid + '/chart/Vitals%20%26%20Biometrics');
  }
}
