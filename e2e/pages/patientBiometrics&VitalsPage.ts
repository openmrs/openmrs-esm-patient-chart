import { Page } from '@playwright/test';

export class BiometricsAndVitalsPage {
  constructor(readonly page: Page) {}
  readonly tableRow = () => this.page.locator('tr');
  readonly startVisitButton = () => this.page.getByRole('button', { name: 'Start a visit' });
  readonly visitType = () => this.page.getByText('Facility Visit');
  readonly submitButton = () => this.page.locator('form').getByRole('button', { name: 'Start a visit' });
  async goto(uuid: string) {
    await this.page.goto('/openmrs/spa/patient/' + uuid + '/chart/Vitals%20%26%20Biometrics');
  }

  async startVisit() {
    await this.startVisitButton().click();
    await this.visitType().click();
    await this.submitButton().click();
  }
}
