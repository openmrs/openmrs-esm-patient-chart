import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showSnackbar } from '@openmrs/esm-framework';
import { useTaskList, setTaskStatusCompleted, type Task } from './task-list.resource';
import TaskListView from './task-list-view.component';

jest.mock('./task-list.resource', () => ({
  useTaskList: jest.fn(),
  setTaskStatusCompleted: jest.fn(),
  getPriorityLabel: jest.fn((priority) => priority),
}));

const mockUseTaskList = jest.mocked(useTaskList);
const mockSetTaskStatusCompleted = jest.mocked(setTaskStatusCompleted);
const mockShowSnackbar = jest.mocked(showSnackbar);

const patientUuid = 'patient-uuid-123';

const baseTasks: Task[] = [
  {
    uuid: 'task-1',
    name: 'Check vitals',
    status: 'not-started',
    createdDate: new Date('2024-01-15T10:00:00Z'),
    completed: false,
    createdBy: 'Dr. Smith',
    assignee: { uuid: 'provider-1', display: 'Nurse Johnson', type: 'person' },
    priority: 'high',
  },
  {
    uuid: 'task-2',
    name: 'Order labs',
    status: 'not-started',
    createdDate: new Date('2024-01-15T11:00:00Z'),
    completed: false,
    createdBy: 'Dr. Smith',
    rationale: 'Patient reported symptoms',
  },
];

describe('TaskListView', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders loading state', () => {
    mockUseTaskList.mockReturnValue({
      tasks: [],
      isLoading: true,
      error: null,
      mutate: jest.fn(),
    });

    render(<TaskListView patientUuid={patientUuid} />);

    expect(screen.queryByText(/no tasks/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/problem loading/i)).not.toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseTaskList.mockReturnValue({
      tasks: [],
      isLoading: false,
      error: new Error('Network error'),
      mutate: jest.fn(),
    });

    render(<TaskListView patientUuid={patientUuid} />);

    expect(screen.getByText(/problem loading the task list/i)).toBeInTheDocument();
  });

  it('renders empty state when there are no tasks', () => {
    mockUseTaskList.mockReturnValue({
      tasks: [],
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    });

    render(<TaskListView patientUuid={patientUuid} />);

    expect(screen.getByText(/no tasks/i)).toBeInTheDocument();
  });

  it('renders task items with name, assignee, and priority', () => {
    mockUseTaskList.mockReturnValue({
      tasks: baseTasks,
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    });

    render(<TaskListView patientUuid={patientUuid} />);

    expect(screen.getByText('Check vitals')).toBeInTheDocument();
    expect(screen.getByText('Nurse Johnson')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();

    expect(screen.getByText('Order labs')).toBeInTheDocument();
    expect(screen.getByText('Patient reported symptoms')).toBeInTheDocument();
  });

  it('shows "No assignment" when task has no assignee', () => {
    mockUseTaskList.mockReturnValue({
      tasks: [baseTasks[1]],
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    });

    render(<TaskListView patientUuid={patientUuid} />);

    expect(screen.getByText(/no assignment/i)).toBeInTheDocument();
  });

  it('shows overdue tag for tasks past their due date', () => {
    const overdueTask: Task = {
      ...baseTasks[0],
      dueDate: {
        type: 'DATE',
        date: new Date('2024-01-10T00:00:00Z'),
      },
    };

    mockUseTaskList.mockReturnValue({
      tasks: [overdueTask],
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    });

    render(<TaskListView patientUuid={patientUuid} />);

    expect(screen.getByText(/overdue/i)).toBeInTheDocument();
  });

  it('does not show overdue tag for completed tasks', () => {
    const completedOverdueTask: Task = {
      ...baseTasks[0],
      completed: true,
      dueDate: {
        type: 'DATE',
        date: new Date('2024-01-10T00:00:00Z'),
      },
    };

    mockUseTaskList.mockReturnValue({
      tasks: [completedOverdueTask],
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    });

    render(<TaskListView patientUuid={patientUuid} />);

    expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument();
  });

  it('does not show overdue tag for tasks without a due date', () => {
    mockUseTaskList.mockReturnValue({
      tasks: [baseTasks[0]],
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    });

    render(<TaskListView patientUuid={patientUuid} />);

    expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument();
  });

  it('calls onTaskClick when a task is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const mockOnTaskClick = jest.fn();

    mockUseTaskList.mockReturnValue({
      tasks: [baseTasks[0]],
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    });

    render(<TaskListView patientUuid={patientUuid} onTaskClick={mockOnTaskClick} />);

    await user.click(screen.getByText('Check vitals'));

    expect(mockOnTaskClick).toHaveBeenCalledWith(baseTasks[0]);
  });

  it('toggles task completion via checkbox', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const mockMutate = jest.fn();
    mockSetTaskStatusCompleted.mockResolvedValue({} as any);

    mockUseTaskList.mockReturnValue({
      tasks: [baseTasks[0]],
      isLoading: false,
      error: null,
      mutate: mockMutate,
    });

    render(<TaskListView patientUuid={patientUuid} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    await waitFor(() => {
      expect(mockSetTaskStatusCompleted).toHaveBeenCalledWith(patientUuid, baseTasks[0], true);
    });
    expect(mockMutate).toHaveBeenCalled();
  });

  it('shows error snackbar when toggle fails', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockSetTaskStatusCompleted.mockRejectedValue(new Error('Network error'));

    mockUseTaskList.mockReturnValue({
      tasks: [baseTasks[0]],
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    });

    render(<TaskListView patientUuid={patientUuid} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'error',
          title: 'Unable to update task',
        }),
      );
    });
  });
});
