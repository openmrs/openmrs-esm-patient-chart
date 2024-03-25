import { type Page } from '@playwright/test';

export class AttachmentsPage {
  constructor(readonly page: Page) {}

  async goTo(uuid: string) {
    await this.page.goto('/openmrs/spa/patient/' + uuid + '/chart/Attachments');
  }
}
