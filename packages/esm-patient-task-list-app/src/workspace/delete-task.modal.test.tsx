import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { getCoreTranslation, showSnackbar } from '@openmrs/esm-framework';
import { deleteTask, type Task } from './task-list.resource';
import DeleteTaskModal from './delete-task.modal';

const mockDeleteTask = vi.mocked(deleteTask);
const mockShowSnackbar = vi.mocked(showSnackbar);
const mockSWRMutate = vi.fn();

vi.mock('./task-list.resource', () => ({
  deleteTask: vi.fn(),
  taskListSWRKey: vi.fn((patientUuid) => `tasks-${patientUuid}`),
}));

vi.mock('swr', () => ({
  useSWRConfig: () => ({ mutate: mockSWRMutate }),
}));

const baseTask: Task = {
  uuid: 'task-uuid-123',
  name: 'Test Task',
  status: 'not-started',
  createdDate: new Date('2024-01-15T10:00:00Z'),
  completed: false,
  createdBy: 'Test User',
};

const defaultProps = {
  closeModal: vi.fn(),
  task: baseTask,
  patientUuid: 'patient-uuid-123',
  onDeleted: vi.fn(),
};

describe('DeleteTaskModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal with correct elements', () => {
    render(<DeleteTaskModal {...defaultProps} />);

    expect(screen.getByRole('heading', { name: /delete task/i })).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete this task/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp(getCoreTranslation('cancel'), 'i') })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp(getCoreTranslation('delete'), 'i') })).toBeInTheDocument();
  });

  it('calls closeModal when Cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(<DeleteTaskModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: new RegExp(getCoreTranslation('cancel'), 'i') });
    await user.click(cancelButton);

    expect(defaultProps.closeModal).toHaveBeenCalled();
  });

  it('deletes the task and shows success snackbar', async () => {
    const user = userEvent.setup();
    mockDeleteTask.mockResolvedValue({} as any);

    render(<DeleteTaskModal {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: new RegExp(getCoreTranslation('delete'), 'i') });
    await user.click(deleteButton);

    expect(mockDeleteTask).toHaveBeenCalledWith('patient-uuid-123', baseTask);
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'success',
        title: 'Task deleted',
      }),
    );
    expect(defaultProps.closeModal).toHaveBeenCalled();
    expect(defaultProps.onDeleted).toHaveBeenCalled();
  });

  it('shows error snackbar when delete fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    mockDeleteTask.mockRejectedValue(new Error('Network error'));

    render(<DeleteTaskModal {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: new RegExp(getCoreTranslation('delete'), 'i') });
    await user.click(deleteButton);

    expect(mockDeleteTask).toHaveBeenCalledWith('patient-uuid-123', baseTask);
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'error',
        title: 'Error deleting task',
      }),
    );
    expect(defaultProps.closeModal).not.toHaveBeenCalled();
    expect(defaultProps.onDeleted).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('mutates the SWR cache after successful deletion', async () => {
    const user = userEvent.setup();
    mockDeleteTask.mockResolvedValue({} as any);

    render(<DeleteTaskModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: new RegExp(getCoreTranslation('delete'), 'i') }));

    await waitFor(() => {
      expect(mockSWRMutate).toHaveBeenCalledWith(`tasks-${defaultProps.patientUuid}`);
    });
  });

  it('shows a loading state while deletion is in progress', async () => {
    const user = userEvent.setup();
    // Return a promise that never resolves to keep the loading state visible
    mockDeleteTask.mockReturnValue(new Promise(() => {}));

    render(<DeleteTaskModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: new RegExp(getCoreTranslation('delete'), 'i') }));

    expect(await screen.findByText(/deleting/i)).toBeInTheDocument();
  });

  it('disables the Delete button while deletion is in progress', async () => {
    const user = userEvent.setup();
    mockDeleteTask.mockReturnValue(new Promise(() => {}));

    render(<DeleteTaskModal {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: new RegExp(getCoreTranslation('delete'), 'i') });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(deleteButton).toBeDisabled();
    });
  });
});
