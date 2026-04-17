import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTask, type Task } from './task-list.resource';
import TaskDetailsView from './task-details-view.component';

jest.mock('./task-list.resource');

const mockUseTask = jest.mocked(useTask);

// Helper to check if a date-like value is displayed (contains digits and date separators)
function expectDateToBeDisplayed() {
  expect(screen.getAllByText(/2024/).length).toBeGreaterThan(0);
}

describe('TaskDetailsView', () => {
  const mockOnBack = jest.fn();
  const mockOnEdit = jest.fn();
  const patientUuid = 'patient-uuid-123';
  const taskUuid = 'task-uuid-456';

  const baseTask: Task = {
    uuid: taskUuid,
    name: 'Test Task',
    status: 'not-started',
    createdDate: new Date('2024-01-15T10:00:00Z'),
    completed: false,
    createdBy: 'Test User',
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T10:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Loading and error states', () => {
    it('shows loading state and hides task content while fetching task', () => {
      mockUseTask.mockReturnValue({
        task: null,
        isLoading: true,
        error: null,
        mutate: jest.fn(),
      });

      render(<TaskDetailsView patientUuid={patientUuid} taskUuid={taskUuid} onBack={mockOnBack} />);

      expect(screen.queryByText(/task/i)).not.toBeInTheDocument();
    });

    it('shows error message and back button when task fails to load', () => {
      mockUseTask.mockReturnValue({
        task: null,
        isLoading: false,
        error: new Error('Failed to load'),
        mutate: jest.fn(),
      });

      render(<TaskDetailsView patientUuid={patientUuid} taskUuid={taskUuid} onBack={mockOnBack} />);

      expect(screen.getByText(/problem loading the task/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /back to task list/i })).toBeInTheDocument();
    });

    it('calls onBack callback when back button is clicked in error state', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      mockUseTask.mockReturnValue({
        task: null,
        isLoading: false,
        error: new Error('Failed to load'),
        mutate: jest.fn(),
      });

      render(<TaskDetailsView patientUuid={patientUuid} taskUuid={taskUuid} onBack={mockOnBack} />);

      const backButton = screen.getByRole('button', { name: /back to task list/i });
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Due date display logic', () => {
    describe('DATE type tasks', () => {
      it('shows only due date (no scheduling info) for DATE type tasks', () => {
        const task: Task = {
          ...baseTask,
          createdDate: new Date('2024-01-15T10:00:00Z'),
          dueDate: {
            type: 'DATE',
            date: new Date('2024-01-20T10:00:00Z'),
          },
        };

        mockUseTask.mockReturnValue({
          task,
          isLoading: false,
          error: null,
          mutate: jest.fn(),
        });

        render(
          <TaskDetailsView patientUuid={patientUuid} taskUuid={taskUuid} onBack={mockOnBack} onEdit={mockOnEdit} />,
        );

        expect(screen.queryByText(/scheduled/i)).not.toBeInTheDocument();
        expect(screen.getByText(/due date/i)).toBeInTheDocument();
        expectDateToBeDisplayed();
      });
    });

    describe('THIS_VISIT type tasks', () => {
      it('shows "today for this visit" when THIS_VISIT task was created today and visit is ongoing', () => {
        const task: Task = {
          ...baseTask,
          createdDate: new Date('2024-01-15T10:00:00Z'),
          dueDate: {
            type: 'THIS_VISIT',
            // No date means visit is ongoing
          },
        };

        mockUseTask.mockReturnValue({
          task,
          isLoading: false,
          error: null,
          mutate: jest.fn(),
        });

        render(
          <TaskDetailsView patientUuid={patientUuid} taskUuid={taskUuid} onBack={mockOnBack} onEdit={mockOnEdit} />,
        );

        expect(screen.getByText(/today for this visit/i)).toBeInTheDocument();
        expect(screen.queryByText(/due date/i)).not.toBeInTheDocument();
      });

      it('shows creation date with "for the same visit" when THIS_VISIT task was created in the past and visit is ongoing', () => {
        const task: Task = {
          ...baseTask,
          createdDate: new Date('2024-01-10T10:00:00Z'),
          dueDate: {
            type: 'THIS_VISIT',
            // No date means visit is ongoing
          },
        };

        mockUseTask.mockReturnValue({
          task,
          isLoading: false,
          error: null,
          mutate: jest.fn(),
        });

        jest.setSystemTime(new Date('2024-01-12T10:00:00Z'));

        render(
          <TaskDetailsView patientUuid={patientUuid} taskUuid={taskUuid} onBack={mockOnBack} onEdit={mockOnEdit} />,
        );

        expect(screen.getByText(/for the same visit/i)).toBeInTheDocument();
        // Should contain a date-like value (digits)
        const schedulingInfo = screen.getByText(/for the same visit/i);
        expect(schedulingInfo).toHaveTextContent(/\d/);
        expect(screen.queryByText(/due date/i)).not.toBeInTheDocument();
      });

      it('shows both scheduling info and due date when THIS_VISIT task has ended visit', () => {
        const task: Task = {
          ...baseTask,
          createdDate: new Date('2024-01-10T10:00:00Z'),
          dueDate: {
            type: 'THIS_VISIT',
            date: new Date('2024-01-12T15:00:00Z'), // Visit ended
          },
        };

        mockUseTask.mockReturnValue({
          task,
          isLoading: false,
          error: null,
          mutate: jest.fn(),
        });

        render(
          <TaskDetailsView patientUuid={patientUuid} taskUuid={taskUuid} onBack={mockOnBack} onEdit={mockOnEdit} />,
        );

        expect(screen.getByText(/for the same visit/i)).toBeInTheDocument();
        expect(screen.getByText(/due date/i)).toBeInTheDocument();
        expectDateToBeDisplayed();
      });
    });

    describe('NEXT_VISIT type tasks', () => {
      it('shows "today for next visit" when NEXT_VISIT task was created today', () => {
        const task: Task = {
          ...baseTask,
          createdDate: new Date('2024-01-15T10:00:00Z'),
          dueDate: {
            type: 'NEXT_VISIT',
            // No date means next visit hasn't ended yet
          },
        };

        mockUseTask.mockReturnValue({
          task,
          isLoading: false,
          error: null,
          mutate: jest.fn(),
        });

        render(
          <TaskDetailsView patientUuid={patientUuid} taskUuid={taskUuid} onBack={mockOnBack} onEdit={mockOnEdit} />,
        );

        expect(screen.getByText(/today for next visit/i)).toBeInTheDocument();
        expect(screen.queryByText(/due date/i)).not.toBeInTheDocument();
      });

      it('shows creation date with "for the following visit" when NEXT_VISIT task was created in the past and visit is ongoing', () => {
        const task: Task = {
          ...baseTask,
          createdDate: new Date('2024-01-10T10:00:00Z'),
          dueDate: {
            type: 'NEXT_VISIT',
            // No date means next visit hasn't ended yet
          },
        };

        mockUseTask.mockReturnValue({
          task,
          isLoading: false,
          error: null,
          mutate: jest.fn(),
        });

        render(
          <TaskDetailsView patientUuid={patientUuid} taskUuid={taskUuid} onBack={mockOnBack} onEdit={mockOnEdit} />,
        );

        expect(screen.getByText(/for the following visit/i)).toBeInTheDocument();
        // Should contain a date-like value (digits)
        const schedulingInfo = screen.getByText(/for the following visit/i);
        expect(schedulingInfo).toHaveTextContent(/\d/);
        expect(screen.queryByText(/due date/i)).not.toBeInTheDocument();
      });

      it('shows both scheduling info and due date when NEXT_VISIT task has ended visit', () => {
        const task: Task = {
          ...baseTask,
          createdDate: new Date('2024-01-10T10:00:00Z'),
          dueDate: {
            type: 'NEXT_VISIT',
            date: new Date('2024-01-18T15:00:00Z'), // Next visit ended
          },
        };

        mockUseTask.mockReturnValue({
          task,
          isLoading: false,
          error: null,
          mutate: jest.fn(),
        });

        render(
          <TaskDetailsView patientUuid={patientUuid} taskUuid={taskUuid} onBack={mockOnBack} onEdit={mockOnEdit} />,
        );

        expect(screen.getByText(/for the following visit/i)).toBeInTheDocument();
        expect(screen.getByText(/due date/i)).toBeInTheDocument();
        expectDateToBeDisplayed();
      });
    });

    describe('Tasks with no due date', () => {
      it('hides scheduling info and due date when task has no due date', () => {
        const task: Task = {
          ...baseTask,
          // No dueDate property
        };

        mockUseTask.mockReturnValue({
          task,
          isLoading: false,
          error: null,
          mutate: jest.fn(),
        });

        render(
          <TaskDetailsView patientUuid={patientUuid} taskUuid={taskUuid} onBack={mockOnBack} onEdit={mockOnEdit} />,
        );

        expect(screen.queryByText(/scheduled/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/due date/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('User interactions', () => {
    it('calls onEdit callback with task when edit button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const task: Task = {
        ...baseTask,
      };

      mockUseTask.mockReturnValue({
        task,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
      });

      render(<TaskDetailsView patientUuid={patientUuid} taskUuid={taskUuid} onBack={mockOnBack} onEdit={mockOnEdit} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
      expect(mockOnEdit).toHaveBeenCalledWith(task);
    });

    it('hides edit button when onEdit prop is not provided', () => {
      const task: Task = {
        ...baseTask,
      };

      mockUseTask.mockReturnValue({
        task,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
      });

      render(<TaskDetailsView patientUuid={patientUuid} taskUuid={taskUuid} onBack={mockOnBack} />);

      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    });
  });

  describe('Task information display', () => {
    it('shows task name, creator, and assignee information', () => {
      const task: Task = {
        ...baseTask,
        name: 'Complete patient assessment',
        createdBy: 'Dr. Smith',
        assignee: {
          uuid: 'provider-uuid',
          display: 'Nurse Johnson',
          type: 'person',
        },
      };

      mockUseTask.mockReturnValue({
        task,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
      });

      render(<TaskDetailsView patientUuid={patientUuid} taskUuid={taskUuid} onBack={mockOnBack} />);

      expect(screen.getByText('Complete patient assessment')).toBeInTheDocument();
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
      expect(screen.getByText('Nurse Johnson')).toBeInTheDocument();
    });

    it('shows "No assignment" text when task has no assignee', () => {
      const task: Task = {
        ...baseTask,
        assignee: undefined,
      };

      mockUseTask.mockReturnValue({
        task,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
      });

      render(<TaskDetailsView patientUuid={patientUuid} taskUuid={taskUuid} onBack={mockOnBack} />);

      expect(screen.getByText(/no assignment/i)).toBeInTheDocument();
    });

    it('shows rationale section when task has rationale text', () => {
      const task: Task = {
        ...baseTask,
        rationale: 'Patient requires follow-up care',
      };

      mockUseTask.mockReturnValue({
        task,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
      });

      render(<TaskDetailsView patientUuid={patientUuid} taskUuid={taskUuid} onBack={mockOnBack} />);

      expect(screen.getByText(/rationale/i)).toBeInTheDocument();
      expect(screen.getByText('Patient requires follow-up care')).toBeInTheDocument();
    });
  });
});
