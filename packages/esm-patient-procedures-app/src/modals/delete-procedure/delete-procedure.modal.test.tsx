import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { mockPatient } from 'tools';
import { showSnackbar, type FetchResponse } from '@openmrs/esm-framework';
import DeleteProcedureModal from './delete-procedure.modal';
import { deleteProcedure } from './procedures.resource';

const mockDeleteProcedure = jest.mocked(deleteProcedure);
const mockShowSnackbar = jest.mocked(showSnackbar);

jest.mock('./procedures.resource', () => ({
  ...jest.requireActual('./procedures.resource'),
  deleteProcedure: jest.fn(),
  useMutatePatientProcedures: jest.fn().mockReturnValue(jest.fn()),
}));

const defaultProps = {
  closeDeleteModal: jest.fn(),
  procedureUuid: '123e4567-e89b-12d3-a456-426614174000',
  patientUuid: mockPatient.id,
};

describe('<DeleteProcedureModal />', () => {
  it('renders a modal with the correct elements', () => {
    render(<DeleteProcedureModal {...defaultProps} />);

    expect(screen.getByRole('heading', { name: /delete procedure/i })).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete this procedure/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('clicking the Cancel button closes the modal', async () => {
    const user = userEvent.setup();

    render(<DeleteProcedureModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    expect(defaultProps.closeDeleteModal).toHaveBeenCalled();
  });

  it('clicking the Delete button deletes the procedure', async () => {
    const user = userEvent.setup();
    mockDeleteProcedure.mockResolvedValue({ status: 200, data: {} } as unknown as FetchResponse);

    render(<DeleteProcedureModal {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(mockDeleteProcedure).toHaveBeenCalledTimes(1);
    expect(mockDeleteProcedure).toHaveBeenCalledWith(defaultProps.procedureUuid);
    expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      kind: 'success',
      title: 'Procedure deleted',
    });
  });

  it('renders an error message if the delete operation fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();

    mockDeleteProcedure.mockRejectedValue({ message: 'Internal server error', status: 500 });

    render(<DeleteProcedureModal {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(mockDeleteProcedure).toHaveBeenCalledTimes(1);
    expect(mockDeleteProcedure).toHaveBeenCalledWith(defaultProps.procedureUuid);
    expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      isLowContrast: false,
      kind: 'error',
      title: 'Error deleting procedure',
      subtitle: 'Internal server error',
    });
    expect(deleteButton).toBeDisabled();

    consoleSpy.mockRestore();
  });
});
