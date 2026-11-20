import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { mockPatient } from 'tools';
import { deleteCondition } from './conditions.resource';
import { OpenmrsFetchError, showSnackbar, type FetchResponse } from '@openmrs/esm-framework';
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

  it("renders the server's reason if the delete operation is rejected by the server", async () => {
    // The modal logs the failed delete with console.error; silence it so the expected error doesn't clutter the test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();

    mockDeleteCondition.mockRejectedValueOnce(
      new OpenmrsFetchError(
        `http://localhost/openmrs/ws/fhir2/R4/Condition/${defaultProps.conditionId}`,
        new Response(null, { status: 500, statusText: 'Internal Server Error' }),
        {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'processing',
              diagnostics:
                'HAPI-0389: Failed to call access method: org.openmrs.api.APIAuthenticationException: Privileges required: Delete Conditions',
            },
          ],
        } as never,
        new Error(),
      ),
    );

    render(<DeleteConditionModal {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(mockShowSnackbar).toHaveBeenCalledWith({
      isLowContrast: false,
      kind: 'error',
      title: 'Error deleting condition',
      subtitle: 'Privileges required: Delete Conditions',
    });

    consoleSpy.mockRestore();
  });

  it('renders the fallback message if the server gives no usable reason for a failed delete', async () => {
    // The modal logs the failed delete with console.error; silence it so the expected error doesn't clutter the test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();

    mockDeleteCondition.mockRejectedValueOnce(
      new OpenmrsFetchError(
        `http://localhost/openmrs/ws/fhir2/R4/Condition/${defaultProps.conditionId}`,
        new Response(null, { status: 401, statusText: 'Unauthorized' }),
        '<!doctype html><html><head><title>HTTP Status 401 – Unauthorized</title></head></html>',
        new Error(),
      ),
    );

    render(<DeleteConditionModal {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(mockShowSnackbar).toHaveBeenCalledWith({
      isLowContrast: false,
      kind: 'error',
      title: 'Error deleting condition',
      subtitle:
        'The condition could not be deleted. Please try again, or contact your system administrator if the problem continues.',
    });

    consoleSpy.mockRestore();
  });
});
