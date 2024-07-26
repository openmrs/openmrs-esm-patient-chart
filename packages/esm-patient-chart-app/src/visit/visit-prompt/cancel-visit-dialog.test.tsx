import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useVisit, openmrsFetch, showSnackbar, type FetchResponse } from '@openmrs/esm-framework';
import { mockCurrentVisit, mockVisitQueueEntries } from '__mocks__';
import { mockPatient } from 'tools';
import { type MappedVisitQueueEntry, useVisitQueueEntry } from '../queue-entry/queue.resource';
import { removeQueuedPatient } from '../hooks/useServiceQueue';
import CancelVisitDialog from './cancel-visit-dialog.component';

const mockCloseModal = jest.fn();
const mockOpenmrsFetch = jest.mocked(openmrsFetch);
const mockRemoveQueuedPatient = jest.mocked(removeQueuedPatient);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockUseVisit = jest.mocked(useVisit);
const mockUseVisitQueueEntry = jest.mocked(useVisitQueueEntry);

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  restBaseUrl: '/ws/rest/v1',
}));

jest.mock('../queue-entry/queue.resource', () => ({
  ...jest.requireActual('../queue-entry/queue.resource'),
  useVisitQueueEntry: jest.fn(),
}));

jest.mock('../hooks/useServiceQueue', () => {
  const originalModule = jest.requireActual('../hooks/useServiceQueue');

  return {
    ...originalModule,
    removeQueuedPatient: jest.fn(),
  };
});

describe('Cancel visit', () => {
  beforeEach(() => {
    mockUseVisit.mockReturnValue({
      activeVisit: mockCurrentVisit,
      currentVisit: mockCurrentVisit,
      currentVisitIsRetrospective: false,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });
  });

  it('cancels the active visit and voids its associated encounters', async () => {
    const user = userEvent.setup();

    const response: Partial<FetchResponse> = {
      statusText: 'ok',
      status: 200,
    };

    mockOpenmrsFetch.mockResolvedValue(response as FetchResponse);
    mockUseVisitQueueEntry.mockReturnValueOnce({
      queueEntry: mockVisitQueueEntries,
      isLoading: false,
      error: undefined,
      isValidating: false,
      mutate: jest.fn(),
    });
    mockRemoveQueuedPatient.mockResolvedValue(response as FetchResponse);

    renderCancelVisitDialog();

    const cancelButton = screen.getByRole('button', { name: /^cancel$/i });
    const cancelVisitButton = screen.getByRole('button', { name: /cancel visit$/i });
    const closeModalButton = screen.getByRole('button', { name: /close/i });

    expect(cancelButton).toBeInTheDocument();
    expect(cancelVisitButton).toBeInTheDocument();
    expect(closeModalButton).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: /Are you sure you want to cancel this active visit?/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Cancelling this visit will delete its associated encounters/i)).toBeInTheDocument();

    await user.click(cancelVisitButton);

    expect(mockOpenmrsFetch).toHaveBeenCalledWith(`/ws/rest/v1/visit/${mockCurrentVisit.uuid}`, {
      method: 'DELETE',
    });
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'success',
        title: 'Visit cancelled',
        subtitle: 'Active Facility Visit cancelled successfully',
      }),
    );
  });

  it('displays an error notification if there was problem with cancelling a visit', async () => {
    const user = userEvent.setup();

    const response: Partial<FetchResponse> = {
      statusText: 'ok',
      status: 200,
    };

    mockOpenmrsFetch.mockRejectedValueOnce({ message: 'Internal server error', status: 500 });
    mockUseVisitQueueEntry.mockReturnValueOnce({
      queueEntry: {} as MappedVisitQueueEntry,
      isLoading: false,
      error: undefined,
      isValidating: false,
      mutate: jest.fn(),
    });

    mockRemoveQueuedPatient.mockResolvedValue(response as FetchResponse);

    renderCancelVisitDialog();

    const cancelButton = screen.getByRole('button', { name: /^cancel$/i });
    const cancelVisitButton = screen.getByRole('button', { name: /cancel visit$/i });
    const closeModalButton = screen.getByRole('button', { name: /close/i });

    expect(cancelButton).toBeInTheDocument();
    expect(cancelVisitButton).toBeInTheDocument();
    expect(closeModalButton).toBeInTheDocument();
    expect(screen.getByText(/Cancelling this visit will delete its associated encounters/i)).toBeInTheDocument();

    await user.click(cancelVisitButton);

    expect(mockOpenmrsFetch).toHaveBeenCalledWith(`/ws/rest/v1/visit/${mockCurrentVisit.uuid}`, {
      method: 'DELETE',
    });
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      subtitle: 'An error occured when deleting visit',
      kind: 'error',
      title: 'Error cancelling active visit',
    });
  });
});

function renderCancelVisitDialog() {
  render(<CancelVisitDialog closeModal={mockCloseModal} patientUuid={mockPatient.id} />);
}
