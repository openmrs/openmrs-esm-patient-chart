import { Page } from '@playwright/test';

export class HomePage {
  constructor(readonly page: Page) {}

  async goto(uuid: string) {
    await this.page.goto('home');
  }
}
