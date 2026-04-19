import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskListWorkspace from './task-list.workspace';

jest.mock('./task-list.resource', () => ({
  useTaskList: jest.fn(),
  useTask: jest.fn(() => ({ task: null, isLoading: false, error: null, mutate: jest.fn() })),
}));

// Mock child components to avoid heavy dependency chains
jest.mock('./task-list-view.component', () => {
  return function MockTaskListView({ onTaskClick }: { onTaskClick?: (task: any) => void }) {
    return (
      <div data-testid="task-list-view">
        <button onClick={() => onTaskClick?.({ uuid: 'task-1', name: 'Mock Task' })}>Mock Task</button>
      </div>
    );
  };
});

jest.mock('./add-task-form.component', () => {
  return function MockAddTaskForm({ onClose, editTaskUuid }: { onClose: () => void; editTaskUuid?: string }) {
    return (
      <div data-testid={editTaskUuid ? 'edit-task-form' : 'add-task-form'}>
        <span>{editTaskUuid ? 'Editing task' : 'Adding task'}</span>
        <button onClick={onClose}>Form back</button>
      </div>
    );
  };
});

jest.mock('./task-details-view.component', () => {
  return function MockTaskDetailsView({ onBack, onEdit }: { onBack: () => void; onEdit?: (task: any) => void }) {
    return (
      <div data-testid="task-details-view">
        <span>Task details</span>
        <button onClick={onBack}>Details back</button>
        {onEdit && <button onClick={() => onEdit({ uuid: 'task-1', name: 'Mock Task' })}>Edit</button>}
      </div>
    );
  };
});

const defaultProps = {
  groupProps: { patientUuid: 'patient-uuid-123', visitContext: { uuid: 'visit-uuid' } },
};

describe('TaskListWorkspace', () => {
  it('renders the task list view by default', () => {
    render(<TaskListWorkspace {...(defaultProps as any)} />);

    expect(screen.getByTestId('task-list-view')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('does not show back button in list view', () => {
    render(<TaskListWorkspace {...(defaultProps as any)} />);

    expect(screen.queryByText(/back to task list/i)).not.toBeInTheDocument();
  });

  it('navigates to form view when Add Task button is clicked', async () => {
    const user = userEvent.setup();

    render(<TaskListWorkspace {...(defaultProps as any)} />);

    await user.click(screen.getByRole('button', { name: /add task/i }));

    expect(screen.getByTestId('add-task-form')).toBeInTheDocument();
    expect(screen.getByText(/back to task list/i)).toBeInTheDocument();
    expect(screen.queryByTestId('task-list-view')).not.toBeInTheDocument();
  });

  it('navigates to details view when a task is clicked', async () => {
    const user = userEvent.setup();

    render(<TaskListWorkspace {...(defaultProps as any)} />);

    await user.click(screen.getByText('Mock Task'));

    expect(screen.getByTestId('task-details-view')).toBeInTheDocument();
    expect(screen.getByText(/back to task list/i)).toBeInTheDocument();
    expect(screen.queryByTestId('task-list-view')).not.toBeInTheDocument();
  });

  it('navigates back to list view from details', async () => {
    const user = userEvent.setup();

    render(<TaskListWorkspace {...(defaultProps as any)} />);

    // Go to details
    await user.click(screen.getByText('Mock Task'));
    expect(screen.getByTestId('task-details-view')).toBeInTheDocument();

    // Go back via back button in the workspace header
    await user.click(screen.getByRole('button', { name: /back to task list/i }));

    expect(screen.getByTestId('task-list-view')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('navigates to edit view from details', async () => {
    const user = userEvent.setup();

    render(<TaskListWorkspace {...(defaultProps as any)} />);

    // Go to details
    await user.click(screen.getByText('Mock Task'));

    // Click edit
    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByTestId('edit-task-form')).toBeInTheDocument();
    expect(screen.getByText(/back to task details/i)).toBeInTheDocument();
  });

  it('navigates from edit back to details', async () => {
    const user = userEvent.setup();

    render(<TaskListWorkspace {...(defaultProps as any)} />);

    // Go to details
    await user.click(screen.getByText('Mock Task'));

    // Go to edit
    await user.click(screen.getByRole('button', { name: /edit/i }));
    expect(screen.getByTestId('edit-task-form')).toBeInTheDocument();

    // Go back to details via workspace header back button
    await user.click(screen.getByRole('button', { name: /back to task details/i }));

    expect(screen.getByTestId('task-details-view')).toBeInTheDocument();
  });
});
