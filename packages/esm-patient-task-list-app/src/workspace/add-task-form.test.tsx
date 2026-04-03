import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddTaskForm from './add-task-form.component';
import {
  useTask,
  saveTask,
  updateTask,
  useFetchProviders,
  useProviderRoles,
  useReferenceVisit,
  type Task,
} from './task-list.resource';
import { getDefaultsFromConfigSchema, showSnackbar, useVisit, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { configSchema, type Config } from '../config-schema';

const emptySystemTasks: never[] = [];
jest.mock('./task-list.resource', () => ({
  useTask: jest.fn(),
  saveTask: jest.fn(),
  updateTask: jest.fn(),
  taskListSWRKey: jest.fn((patientUuid) => `tasks-${patientUuid}`),
  useFetchProviders: jest.fn(),
  useProviderRoles: jest.fn(),
  useReferenceVisit: jest.fn(),
  getPriorityLabel: jest.fn((priority) => priority),
  useSystemTasks: jest.fn(() => ({ systemTasks: emptySystemTasks, isLoading: false })),
}));

const mockUseTask = jest.mocked(useTask);
const mockSaveTask = jest.mocked(saveTask);
const mockUpdateTask = jest.mocked(updateTask);
const mockUseFetchProviders = jest.mocked(useFetchProviders);
const mockUseProviderRoles = jest.mocked(useProviderRoles);
const mockUseReferenceVisit = jest.mocked(useReferenceVisit);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockUseConfig = jest.mocked(useConfig<Config>);

describe('AddTaskForm', () => {
  const patientUuid = 'patient-uuid-123';
  const mockOnBack = jest.fn();

  const baseTask: Task = {
    uuid: 'task-uuid-456',
    name: 'Existing Task',
    status: 'not-started',
    createdDate: new Date('2024-01-15T10:00:00Z'),
    completed: false,
    createdBy: 'Test User',
    rationale: 'Test rationale',
    priority: 'high',
    dueDate: {
      type: 'DATE',
      date: new Date('2024-01-20T10:00:00Z'),
    },
    assignee: {
      uuid: 'provider-uuid-789',
      display: 'Dr. Test Provider',
      type: 'person',
    },
  };

  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
    });

    // Default mocks
    mockUseTask.mockReturnValue({
      task: null,
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    });

    mockUseFetchProviders.mockReturnValue({
      providers: [],
      setProviderQuery: jest.fn(),
      isLoading: false,
      error: null,
    });

    mockUseProviderRoles.mockReturnValue([]);

    mockUseReferenceVisit.mockReturnValue({
      data: { results: [{ uuid: 'reference-visit-uuid' }] },
      isLoading: false,
      error: null,
    });

    mockSaveTask.mockResolvedValue({} as any);
    mockUpdateTask.mockResolvedValue({} as any);
  });

  describe('Create mode (no editTaskUuid)', () => {
    it('should render the form with empty fields', () => {
      render(<AddTaskForm patientUuid={patientUuid} onBack={mockOnBack} />);

      expect(screen.getByLabelText(/task name/i)).toHaveValue('');
      expect(screen.getByText(/add task/i)).toBeInTheDocument();
      expect(screen.getByText(/discard/i)).toBeInTheDocument();
    });

    it('should call saveTask when submitting in create mode', async () => {
      const user = userEvent.setup();

      render(<AddTaskForm patientUuid={patientUuid} onBack={mockOnBack} />);

      const taskNameInput = screen.getByLabelText(/task name/i);
      await user.type(taskNameInput, 'New Task');

      const addButton = screen.getByRole('button', { name: /add task/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(mockSaveTask).toHaveBeenCalledWith(
          patientUuid,
          expect.objectContaining({
            name: 'New Task',
          }),
        );
      });

      expect(mockUpdateTask).not.toHaveBeenCalled();
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Task added',
          kind: 'success',
        }),
      );
      expect(mockOnBack).toHaveBeenCalled();
    });

    it('should show error snackbar when saveTask fails', async () => {
      const user = userEvent.setup();
      mockSaveTask.mockRejectedValue(new Error('Network error'));

      render(<AddTaskForm patientUuid={patientUuid} onBack={mockOnBack} />);

      const taskNameInput = screen.getByLabelText(/task name/i);
      await user.type(taskNameInput, 'New Task');

      const addButton = screen.getByRole('button', { name: /add task/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Task add failed',
            kind: 'error',
          }),
        );
      });

      expect(mockOnBack).not.toHaveBeenCalled();
    });
  });

  describe('Edit mode (with editTaskUuid)', () => {
    const editTaskUuid = 'task-uuid-456';

    beforeEach(() => {
      mockUseTask.mockReturnValue({
        task: baseTask,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
      });
    });

    it('should render the form with "Save task" and "Cancel" buttons', async () => {
      render(<AddTaskForm patientUuid={patientUuid} onBack={mockOnBack} editTaskUuid={editTaskUuid} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save task/i })).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.queryByText(/add task/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/discard/i)).not.toBeInTheDocument();
    });

    it('should pre-populate form fields with existing task data', async () => {
      render(<AddTaskForm patientUuid={patientUuid} onBack={mockOnBack} editTaskUuid={editTaskUuid} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/task name/i)).toHaveValue('Existing Task');
      });

      // Check rationale is populated
      const rationaleTextarea = screen.getByPlaceholderText(/add a note here/i);
      expect(rationaleTextarea).toHaveValue('Test rationale');

      // Check due date picker is shown (DATE type shows the date input)
      // Wait for the date picker to render (react-hook-form reset + watch timing)
      await waitFor(() => {
        expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
      });

      // Check priority is shown in the combobox input
      const priorityInput = screen.getByRole('combobox', { name: /priority/i });
      expect(priorityInput).toHaveValue('high');

      // Check assignee is shown in the combobox input
      const assigneeInput = screen.getByRole('combobox', { name: /^assign to provider$/i });
      expect(assigneeInput).toHaveValue('Dr. Test Provider');
    });

    it('should call updateTask when submitting in edit mode', async () => {
      const user = userEvent.setup();

      render(<AddTaskForm patientUuid={patientUuid} onBack={mockOnBack} editTaskUuid={editTaskUuid} />);

      // Wait for form to be populated
      await waitFor(() => {
        expect(screen.getByLabelText(/task name/i)).toHaveValue('Existing Task');
      });

      // Modify the task name
      const taskNameInput = screen.getByLabelText(/task name/i);
      await user.clear(taskNameInput);
      await user.type(taskNameInput, 'Updated Task Name');

      const saveButton = screen.getByRole('button', { name: /save task/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith(
          patientUuid,
          expect.objectContaining({
            uuid: editTaskUuid,
            name: 'Updated Task Name',
          }),
        );
      });

      expect(mockSaveTask).not.toHaveBeenCalled();
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Task updated',
          kind: 'success',
        }),
      );
      expect(mockOnBack).toHaveBeenCalled();
    });

    it('should show error snackbar when updateTask fails', async () => {
      const user = userEvent.setup();
      mockUpdateTask.mockRejectedValue(new Error('Network error'));

      render(<AddTaskForm patientUuid={patientUuid} onBack={mockOnBack} editTaskUuid={editTaskUuid} />);

      // Wait for form to be populated
      await waitFor(() => {
        expect(screen.getByLabelText(/task name/i)).toHaveValue('Existing Task');
      });

      const saveButton = screen.getByRole('button', { name: /save task/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Unable to update task',
            kind: 'error',
          }),
        );
      });

      expect(mockOnBack).not.toHaveBeenCalled();
    });

    it('should preserve existing task properties when updating', async () => {
      const user = userEvent.setup();

      render(<AddTaskForm patientUuid={patientUuid} onBack={mockOnBack} editTaskUuid={editTaskUuid} />);

      // Wait for form to be populated
      await waitFor(() => {
        expect(screen.getByLabelText(/task name/i)).toHaveValue('Existing Task');
      });

      const saveButton = screen.getByRole('button', { name: /save task/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith(
          patientUuid,
          expect.objectContaining({
            uuid: baseTask.uuid,
            status: baseTask.status,
            createdDate: baseTask.createdDate,
            completed: baseTask.completed,
            createdBy: baseTask.createdBy,
            priority: baseTask.priority,
            assignee: expect.objectContaining({
              uuid: baseTask.assignee.uuid,
              type: 'person',
            }),
            dueDate: expect.objectContaining({
              type: 'DATE',
            }),
          }),
        );
      });
    });
  });

  describe('Edit mode with different due date types', () => {
    it('should select DATE tab and show date picker when editing task with DATE due date', async () => {
      mockUseTask.mockReturnValue({
        task: baseTask, // baseTask has dueDate.type = 'DATE'
        isLoading: false,
        error: null,
        mutate: jest.fn(),
      });

      render(<AddTaskForm patientUuid={patientUuid} onBack={mockOnBack} editTaskUuid="task-uuid-456" />);

      await waitFor(() => {
        expect(screen.getByLabelText(/task name/i)).toHaveValue('Existing Task');
      });

      // Verify DATE tab is selected
      const dateTab = screen.getByRole('tab', { name: /^date$/i });
      expect(dateTab).toHaveAttribute('aria-selected', 'true');

      // Verify other tabs are not selected
      const thisVisitTab = screen.getByRole('tab', { name: /this visit/i });
      const nextVisitTab = screen.getByRole('tab', { name: /next visit/i });
      expect(thisVisitTab).toHaveAttribute('aria-selected', 'false');
      expect(nextVisitTab).toHaveAttribute('aria-selected', 'false');

      // Verify date input is shown
      // Wait for the date picker to render (react-hook-form reset + watch timing)
      await waitFor(() => {
        expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
      });
    });

    it('should select THIS_VISIT tab when editing task with THIS_VISIT due date', async () => {
      const taskWithThisVisit: Task = {
        ...baseTask,
        dueDate: {
          type: 'THIS_VISIT',
          referenceVisitUuid: 'visit-uuid-123',
        },
      };

      mockUseTask.mockReturnValue({
        task: taskWithThisVisit,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
      });

      render(<AddTaskForm patientUuid={patientUuid} onBack={mockOnBack} editTaskUuid="task-uuid-456" />);

      await waitFor(() => {
        expect(screen.getByLabelText(/task name/i)).toHaveValue('Existing Task');
      });

      // Verify THIS_VISIT tab is selected
      const thisVisitTab = screen.getByRole('tab', { name: /this visit/i });
      expect(thisVisitTab).toHaveAttribute('aria-selected', 'true');

      // Verify other tabs are not selected
      const dateTab = screen.getByRole('tab', { name: /^date$/i });
      const nextVisitTab = screen.getByRole('tab', { name: /next visit/i });
      expect(dateTab).toHaveAttribute('aria-selected', 'false');
      expect(nextVisitTab).toHaveAttribute('aria-selected', 'false');

      // Verify date input is NOT shown (visit-based due dates don't show date picker)
      expect(screen.queryByDisplayValue('20/01/2024')).not.toBeInTheDocument();
    });

    it('should select NEXT_VISIT tab when editing task with NEXT_VISIT due date', async () => {
      const taskWithNextVisit: Task = {
        ...baseTask,
        dueDate: {
          type: 'NEXT_VISIT',
          referenceVisitUuid: 'visit-uuid-456',
        },
      };

      mockUseTask.mockReturnValue({
        task: taskWithNextVisit,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
      });

      render(<AddTaskForm patientUuid={patientUuid} onBack={mockOnBack} editTaskUuid="task-uuid-456" />);

      await waitFor(() => {
        expect(screen.getByLabelText(/task name/i)).toHaveValue('Existing Task');
      });

      // Verify NEXT_VISIT tab is selected
      const nextVisitTab = screen.getByRole('tab', { name: /next visit/i });
      expect(nextVisitTab).toHaveAttribute('aria-selected', 'true');

      // Verify other tabs are not selected
      const dateTab = screen.getByRole('tab', { name: /^date$/i });
      const thisVisitTab = screen.getByRole('tab', { name: /this visit/i });
      expect(dateTab).toHaveAttribute('aria-selected', 'false');
      expect(thisVisitTab).toHaveAttribute('aria-selected', 'false');
    });

    it('should send provider role assignee when updating task with role assignment', async () => {
      const user = userEvent.setup();
      const taskWithRoleAssignee: Task = {
        ...baseTask,
        assignee: {
          uuid: 'role-uuid-123',
          display: 'Nurse Role',
          type: 'role',
        },
      };

      mockUseTask.mockReturnValue({
        task: taskWithRoleAssignee,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
      });

      mockUseConfig.mockReturnValue({
        ...getDefaultsFromConfigSchema(configSchema),
        allowAssigningProviderRole: true,
      });

      render(<AddTaskForm patientUuid={patientUuid} onBack={mockOnBack} editTaskUuid="task-uuid-456" />);

      await waitFor(() => {
        expect(screen.getByLabelText(/task name/i)).toHaveValue('Existing Task');
      });

      // Verify the role is displayed in the provider role combobox
      const roleInput = screen.getByRole('combobox', { name: /assign to provider role/i });
      expect(roleInput).toHaveValue('Nurse Role');

      const saveButton = screen.getByRole('button', { name: /save task/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith(
          patientUuid,
          expect.objectContaining({
            assignee: expect.objectContaining({
              uuid: 'role-uuid-123',
              type: 'role',
            }),
          }),
        );
      });
    });
  });
});
