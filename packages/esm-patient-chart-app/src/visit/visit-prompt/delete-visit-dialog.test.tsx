import { openmrsFetch, showSnackbar, type FetchResponse } from '@openmrs/esm-framework';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockCurrentVisit } from '__mocks__';
import React from 'react';
import { mockPatient } from 'tools';
import DeleteVisitDialog from './delete-visit-dialog.component';

const mockCloseModal = jest.fn();
const mockOpenmrsFetch = jest.mocked(openmrsFetch);
const mockShowSnackbar = jest.mocked(showSnackbar);

describe('Delete visit', () => {
  it('voids the visit and voids its associated encounters', async () => {
    const user = userEvent.setup();

    const response: Partial<FetchResponse> = {
      statusText: 'ok',
      status: 200,
    };

    mockOpenmrsFetch.mockResolvedValue(response as FetchResponse);

    render(<DeleteVisitDialog visit={mockCurrentVisit} closeModal={mockCloseModal} patientUuid={mockPatient.id} />);

    const cancelButton = screen.getByRole('button', { name: /^cancel$/i });
    const deleteVisitButton = screen.getByRole('button', { name: /delete visit$/i });
    const closeModalButton = screen.getByRole('button', { name: /close/i });

    expect(cancelButton).toBeInTheDocument();
    expect(deleteVisitButton).toBeInTheDocument();
    expect(closeModalButton).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /Are you sure you want to delete this visit?/i })).toBeInTheDocument();
    expect(screen.getByText(/Deleting this Facility Visit will delete its associated encounters/i)).toBeInTheDocument();

    await user.click(deleteVisitButton);

    expect(mockOpenmrsFetch).toHaveBeenCalledWith(`/ws/rest/v1/visit/${mockCurrentVisit.uuid}`, {
      method: 'DELETE',
    });
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'success',
        title: 'Facility Visit deleted',
        subtitle: 'Facility Visit deleted successfully',
      }),
    );
  });

  it('displays an error notification if there was problem with deleting a visit', async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockRejectedValueOnce({ message: 'Internal server error', status: 500 });

    render(<DeleteVisitDialog visit={mockCurrentVisit} closeModal={mockCloseModal} patientUuid={mockPatient.id} />);

    const cancelButton = screen.getByRole('button', { name: /^cancel$/i });
    const deleteVisitButton = screen.getByRole('button', { name: /delete visit$/i });
    const closeModalButton = screen.getByRole('button', { name: /close/i });

    expect(cancelButton).toBeInTheDocument();
    expect(deleteVisitButton).toBeInTheDocument();
    expect(closeModalButton).toBeInTheDocument();
    expect(screen.getByText(/Deleting this Facility Visit will delete its associated encounters/i)).toBeInTheDocument();

    await user.click(deleteVisitButton);

    expect(mockOpenmrsFetch).toHaveBeenCalledWith(`/ws/rest/v1/visit/${mockCurrentVisit.uuid}`, {
      method: 'DELETE',
    });
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      subtitle: 'An error occurred when deleting visit',
      kind: 'error',
      title: 'Error deleting visit',
    });
  });
});
