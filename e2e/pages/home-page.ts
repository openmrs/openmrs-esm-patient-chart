import { type Page } from '@playwright/test';

export class HomePage {
  constructor(readonly page: Page) {}

  readonly myAccountButton = () => this.page.getByRole('button', { name: /my account/i });

  readonly changeLanguageButton = () =>
    this.page.getByLabel(/change language/i).getByRole('button', { name: /change/i });

  async goTo() {
    await this.page.goto('/openmrs/spa/home');
  }
}
