import { Page } from '@playwright/test';

export class AllergiesPage {
  constructor(readonly page: Page) {}

  readonly addAllergyButton = () => this.page.getByText('Record');
  readonly drugAllergenOption = () => this.page.getByText('ACE inhibitors');
  readonly reactionOption = () => this.page.getByText('Mental status change');
  readonly severityOption = () => this.page.getByText('Mild').or(this.page.getByText('LOW'));
  readonly submitButton = () => this.page.getByText('Save');
  readonly foodSelect = () => this.page.getByText('Food');
  readonly foodAllergenOption = () => this.page.getByText('Eggs');
  readonly environmentalAllergenOption = () => this.page.getByText('Dust');
  readonly environmentalSelect = () => this.page.getByText('Environmental');
  readonly commentInputContainer = () => this.page.locator('#comments');
  readonly savedMessage = () => this.page.getByText('saved');
  readonly commentMessage = () => this.page.getByText('Test comment');
  async goto(uuid: string) {
    await this.page.goto('/openmrs/spa/patient/' + uuid + '/chart/Allergies');
  }
  async addDrugAllergy() {
    await this.addAllergyButton().click();
    await this.drugAllergenOption().click();
    await this.reactionOption().click();
    await this.severityOption().click();
    await this.commentInputContainer().fill('Test comment');
    await this.submitButton().click();
  }
  async addFoodAllergy() {
    await this.addAllergyButton().click();
    await this.foodSelect().click();
    await this.foodAllergenOption().click();
    await this.reactionOption().click();
    await this.severityOption().click();
    await this.commentInputContainer().fill('Test comment');
    await this.submitButton().click();
  }
  async addEnvironmentalAllergy() {
    await this.addAllergyButton().click();
    await this.environmentalSelect().click();
    await this.environmentalAllergenOption().click();
    await this.reactionOption().click();
    await this.severityOption().click();
    await this.commentInputContainer().fill('Test comment');
    await this.submitButton().click();
  }
}
