import { expect } from '@playwright/test';
import { test } from '../core';
import { ChartPage, TaskListPage } from '../pages';
import { createTask, type CreatedTask } from '../commands';

test.describe('Task List workspace', () => {
  test('Opens the task list workspace and shows an empty state', async ({ page, patient }) => {
    const chartPage = new ChartPage(page);
    const taskList = new TaskListPage(page);

    await test.step('When I navigate to the patient chart', async () => {
      await chartPage.goTo(patient.uuid);
    });

    await test.step('And I open the task list workspace', async () => {
      await taskList.openWorkspace();
    });

    await test.step('Then I should see the empty state message', async () => {
      await expect(page.getByText(/no tasks/i)).toBeVisible();
    });

    await test.step('And the Add Task button should be visible', async () => {
      await expect(page.getByRole('button', { name: /add task/i })).toBeVisible();
    });
  });

  test('Adds a new task via the Add Task form', async ({ page, patient }) => {
    const chartPage = new ChartPage(page);
    const taskList = new TaskListPage(page);
    const taskName = `E2E Task ${Date.now()}`;

    await test.step('When I navigate to the patient chart and open the task list', async () => {
      await chartPage.goTo(patient.uuid);
      await taskList.openWorkspace();
    });

    await test.step('And I click Add Task to open the form', async () => {
      await taskList.clickAddTask();
      await expect(page.getByLabel(/task name/i)).toBeVisible();
    });

    await test.step('And I fill in the task name and submit', async () => {
      await taskList.fillAddTaskForm({ name: taskName });
    });

    await test.step('Then a success notification should appear', async () => {
      await expect(page.getByText(/task added/i)).toBeVisible();
    });

    await test.step('And the task should appear in the task list', async () => {
      await expect(page.getByText(taskName)).toBeVisible();
    });
  });

  test('Adds a task with priority and rationale', async ({ page, patient }) => {
    const chartPage = new ChartPage(page);
    const taskList = new TaskListPage(page);
    const taskName = `Priority Task ${Date.now()}`;
    const rationale = 'Patient requires urgent follow-up';

    await test.step('When I navigate to the patient chart and open the task list', async () => {
      await chartPage.goTo(patient.uuid);
      await taskList.openWorkspace();
    });

    await test.step('And I open the Add Task form and fill in all fields', async () => {
      await taskList.clickAddTask();
      await taskList.fillAddTaskForm({ name: taskName, priority: 'High', rationale });
    });

    await test.step('Then a success notification should appear', async () => {
      await expect(page.getByText(/task added/i)).toBeVisible();
    });

    await test.step('And the task should appear in the list with the High priority tag', async () => {
      await expect(page.getByText(taskName)).toBeVisible();
      await expect(page.getByText(/high/i).first()).toBeVisible();
    });
  });

  test('Marks a task as complete', async ({ page, patient, api }) => {
    const chartPage = new ChartPage(page);
    const taskList = new TaskListPage(page);
    const taskName = `Complete Me ${Date.now()}`;
    let createdTask: CreatedTask;

    await test.step('Given a task exists for the patient', async () => {
      createdTask = await createTask(api, patient.uuid, { name: taskName });
    });

    await test.step('When I navigate to the patient chart and open the task list', async () => {
      await chartPage.goTo(patient.uuid);
      await taskList.openWorkspace();
    });

    await test.step('And the task is visible in the list', async () => {
      await expect(page.getByText(taskName)).toBeVisible();
    });

    await test.step('And I click the task checkbox to mark it complete', async () => {
      await page.locator(`label[for="task-${createdTask.id}"]`).click();
    });

    await test.step('Then the task should be visually marked as completed', async () => {
      await expect(page.locator(`#task-${createdTask.id}`)).toBeChecked();
    });
  });

  test('Opens task details and edits the task', async ({ page, patient, api }) => {
    const chartPage = new ChartPage(page);
    const taskList = new TaskListPage(page);
    const taskName = `Editable Task ${Date.now()}`;
    const updatedName = `Updated Task ${Date.now()}`;

    await test.step('Given a task exists for the patient', async () => {
      await createTask(api, patient.uuid, { name: taskName });
    });

    await test.step('When I navigate to the patient chart and open the task list', async () => {
      await chartPage.goTo(patient.uuid);
      await taskList.openWorkspace();
    });

    await test.step('And I click on the task to open its details view', async () => {
      await taskList.openTaskDetails(taskName);
      await expect(page.getByText(taskName)).toBeVisible();
    });

    await test.step('And I click the Edit button to open the edit form', async () => {
      await page.getByRole('button', { name: /edit/i }).click();
      await expect(page.getByLabel(/task name/i)).toBeVisible();
    });

    await test.step('And I update the task name and save', async () => {
      await page.getByLabel(/task name/i).clear();
      await page.getByLabel(/task name/i).fill(updatedName);
      await page.getByRole('button', { name: /save task/i }).click();
    });

    await test.step('Then a success notification should appear', async () => {
      await expect(page.getByText(/task updated/i)).toBeVisible();
    });
  });

  test('Deletes a task from the task details view', async ({ page, patient, api }) => {
    const chartPage = new ChartPage(page);
    const taskList = new TaskListPage(page);
    const taskName = `Delete Me ${Date.now()}`;

    await test.step('Given a task exists for the patient', async () => {
      await createTask(api, patient.uuid, { name: taskName });
    });

    await test.step('When I navigate to the patient chart and open the task list', async () => {
      await chartPage.goTo(patient.uuid);
      await taskList.openWorkspace();
    });

    await test.step('And I open the task details', async () => {
      await taskList.openTaskDetails(taskName);
      await expect(page.getByText(taskName)).toBeVisible();
    });

    await test.step('And I click Delete and confirm in the confirmation modal', async () => {
      await taskList.clickDeleteTask();
      await expect(page.getByText(/are you sure you want to delete this task/i)).toBeVisible();
      await taskList.confirmDeleteTask();
    });

    await test.step('Then a success notification should appear', async () => {
      await expect(page.getByText(/task deleted/i)).toBeVisible();
    });

    await test.step('And the task should no longer appear in the task list', async () => {
      await expect(page.getByText(taskName)).not.toBeVisible();
    });
  });
});
