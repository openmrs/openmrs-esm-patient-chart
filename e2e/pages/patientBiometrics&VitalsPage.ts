import { Page } from '@playwright/test';

export class BiometricsAndVitalsPage {
  constructor(readonly page: Page) {}

  async goto(uuid: string) {
    await this.page.goto('/openmrs/spa/patient/' + uuid + '/chart/Vitals%20%26%20Biometrics');
  }
}
