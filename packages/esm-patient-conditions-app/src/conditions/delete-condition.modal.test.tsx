import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { mockPatient } from 'tools';
import { deleteCondition } from './conditions.resource';
import { showSnackbar, type FetchResponse } from '@openmrs/esm-framework';
import DeleteConditionModal from './delete-condition.modal';

const mockDeleteCondition = vi.mocked(deleteCondition);
const mockShowSnackbar = vi.mocked(showSnackbar);

vi.mock('./conditions.resource', async () => ({
  ...((await vi.importActual('./conditions.resource')) as object),
  deleteCondition: vi.fn(),
  useConditions: vi.fn().mockReturnValue({ mutate: vi.fn() }),
}));

const defaultProps = {
  closeDeleteModal: vi.fn(),
  conditionId: '123e4567-e89b-12d3-a456-426614174000',
  patientUuid: mockPatient.id,
};

describe('<DeleteConditionModal />', () => {
  it('renders a modal with the correct elements', () => {
    render(<DeleteConditionModal {...defaultProps} />);

    expect(screen.getByRole('heading', { name: /delete condition/i })).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete this condition/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('clicking the Cancel button closes the modal', async () => {
    const user = userEvent.setup();

    render(<DeleteConditionModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    expect(defaultProps.closeDeleteModal).toHaveBeenCalled();
  });

  it('clicking the Delete button deletes the condition', async () => {
    const user = userEvent.setup();
    mockDeleteCondition.mockResolvedValue({ status: 200, data: {} } as unknown as FetchResponse);

    render(<DeleteConditionModal {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(mockDeleteCondition).toHaveBeenCalledTimes(1);
    expect(mockDeleteCondition).toHaveBeenCalledWith(defaultProps.conditionId);
    expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      kind: 'success',
      title: 'Condition deleted',
    });
  });

  it('renders an error message if the delete operation fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();

    mockDeleteCondition.mockRejectedValue({ message: 'Internal server error', status: 500 });

    render(<DeleteConditionModal {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(mockDeleteCondition).toHaveBeenCalledTimes(1);
    expect(mockDeleteCondition).toHaveBeenCalledWith(defaultProps.conditionId);
    expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      isLowContrast: false,
      kind: 'error',
      title: 'Error deleting condition',
      subtitle: 'Internal server error',
    });
    expect(deleteButton).toBeEnabled();

    consoleSpy.mockRestore();
  });
});
