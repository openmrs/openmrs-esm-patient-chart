import { type Page, expect } from '@playwright/test';

/**
 * Page object for the Task List workspace that opens from the patient chart's action menu.
 * Navigate to the chart first using `ChartPage.goTo(patientUuid)`, then call
 * `openWorkspace()` here.
 */
export class TaskListPage {
  constructor(readonly page: Page) {}

  /** Click the "Task list" button in the chart's action menu to open the workspace. */
  async openWorkspace() {
    const taskListBtn = this.page.getByRole('button', { name: /task list/i });
    await taskListBtn.waitFor({ state: 'visible' });
    await taskListBtn.click();
    await expect(this.page.getByRole('button', { name: /add task/i })).toBeVisible();
  }

  /** Click "Add Task" inside the workspace to open the create form. */
  async clickAddTask() {
    await this.page.getByRole('button', { name: /add task/i }).click();
  }

  /**
   * Fill and submit the Add Task form.
   * Only `name` is required; all other fields are optional.
   *
   * The task name field renders as a ComboBox (when system tasks are configured) or a
   * plain TextInput. `pressSequentially` triggers the ComboBox's onInputChange handler
   * reliably in both cases.
   */
  async fillAddTaskForm({
    name,
    rationale,
    priority,
  }: {
    name: string;
    rationale?: string;
    priority?: 'High' | 'Medium' | 'Low';
  }) {
    const taskNameInput = this.page.getByLabel(/task name/i);
    await taskNameInput.click();
    await taskNameInput.pressSequentially(name);

    if (priority) {
      await this.page.getByRole('combobox', { name: /priority/i }).click();
      await this.page.getByRole('option', { name: priority }).click();
    }

    if (rationale) {
      await this.page.getByPlaceholder(/add a note here/i).fill(rationale);
    }

    // When the form is open (view==='form'), the workspace "Add Task" launcher is not rendered,
    // so this selector uniquely targets the form's submit button.
    await this.page.getByRole('button', { name: /add task/i }).click();
  }

  /** Click a task tile in the list to open its details view. */
  async openTaskDetails(taskName: string) {
    await this.page.getByText(taskName, { exact: true }).first().click();
  }

  /** Click the Delete button in the task details view. */
  async clickDeleteTask() {
    await this.page.getByRole('button', { name: /delete/i }).click();
  }

  /** Confirm deletion in the confirmation modal. */
  async confirmDeleteTask() {
    // Carbon's `kind="danger"` buttons prepend a visually-hidden "danger" span
    // (for screen readers), so the accessible name is "dangerDelete" rather than
    // "Delete". Match the dangerDescription prefix to find the button reliably.
    await this.page
      .getByRole('dialog')
      .getByRole('button', { name: /danger\s*delete/i })
      .click();
  }
}
