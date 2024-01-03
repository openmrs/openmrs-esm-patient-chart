import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  useVisit,
  openmrsFetch,
  showSnackbar,
  type FetchResponse,
  showActionableNotification,
} from '@openmrs/esm-framework';
import { mockCurrentVisit, mockVisitQueueEntries } from '__mocks__';
import { mockPatient } from 'tools';
import { type MappedVisitQueueEntry, useVisitQueueEntry } from '../queue-entry/queue.resource';
import { removeQueuedPatient } from '../hooks/useServiceQueue';
import CancelVisitDialog from './cancel-visit-dialog.component';

const mockedCloseModal = jest.fn();
const mockedOpenmrsFetch = jest.mocked(openmrsFetch);
const mockedRemoveQueuedPatient = jest.mocked(removeQueuedPatient);
const mockedActionableNotification = jest.mocked(showActionableNotification);
const mockedShowSnackbar = jest.mocked(showSnackbar);
const mockedUseVisit = jest.mocked(useVisit) as jest.Mock;
const mockedUseVisitQueueEntry = jest.mocked(useVisitQueueEntry);

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useVisit: jest.fn(),
    openmrsFetch: jest.fn(),
  };
});

jest.mock('../queue-entry/queue.resource', () => {
  const originalModule = jest.requireActual('../queue-entry/queue.resource');

  return {
    ...originalModule,
    useVisitQueueEntry: jest.fn(),
  };
});

jest.mock('../hooks/useServiceQueue', () => {
  const originalModule = jest.requireActual('../hooks/useServiceQueue');

  return {
    ...originalModule,
    removeQueuedPatient: jest.fn(),
  };
});

describe('Cancel visit', () => {
  it('cancels the active visit and voids its associated encounters', async () => {
    const user = userEvent.setup();

    mockedUseVisit.mockReturnValue({ currentVisit: mockCurrentVisit, mutate: jest.fn() });

    const response: Partial<FetchResponse> = {
      statusText: 'ok',
      status: 200,
    };

    mockedOpenmrsFetch.mockResolvedValue(response as FetchResponse);
    mockedUseVisitQueueEntry.mockReturnValueOnce({
      queueEntry: mockVisitQueueEntries,
      isLoading: false,
      isError: undefined,
      isValidating: false,
      mutate: jest.fn(),
    });
    mockedRemoveQueuedPatient.mockResolvedValue(response as FetchResponse);

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

    expect(mockedOpenmrsFetch).toHaveBeenCalledWith(`/ws/rest/v1/visit/${mockCurrentVisit.uuid}`, {
      method: 'DELETE',
    });

    expect(mockedActionableNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'success',
        title: 'Visit cancelled',
        subtitle: 'Active Facility Visit cancelled successfully',
        actionButtonLabel: 'Undo',
      }),
    );
  });

  it('displays an error notification if there was problem with cancelling a visit', async () => {
    const user = userEvent.setup();

    const response: Partial<FetchResponse> = {
      statusText: 'ok',
      status: 200,
    };

    mockedUseVisit.mockReturnValue({ currentVisit: mockCurrentVisit, mutate: jest.fn() });
    mockedOpenmrsFetch.mockRejectedValueOnce({ message: 'Internal server error', status: 500 });
    mockedUseVisitQueueEntry.mockReturnValueOnce({
      queueEntry: {} as MappedVisitQueueEntry,
      isLoading: false,
      isError: undefined,
      isValidating: false,
      mutate: jest.fn(),
    });

    mockedRemoveQueuedPatient.mockResolvedValue(response as FetchResponse);

    renderCancelVisitDialog();

    const cancelButton = screen.getByRole('button', { name: /^cancel$/i });
    const cancelVisitButton = screen.getByRole('button', { name: /cancel visit$/i });
    const closeModalButton = screen.getByRole('button', { name: /close/i });

    expect(cancelButton).toBeInTheDocument();
    expect(cancelVisitButton).toBeInTheDocument();
    expect(closeModalButton).toBeInTheDocument();
    expect(screen.getByText(/Cancelling this visit will delete its associated encounters/i)).toBeInTheDocument();

    await user.click(cancelVisitButton);

    expect(mockedOpenmrsFetch).toHaveBeenCalledWith(`/ws/rest/v1/visit/${mockCurrentVisit.uuid}`, {
      method: 'DELETE',
    });

    expect(mockedShowSnackbar).toHaveBeenCalledWith({
      subtitle: 'An error occured when deleting visit',
      kind: 'error',
      title: 'Error cancelling active visit',
    });
  });
});

function renderCancelVisitDialog() {
  render(<CancelVisitDialog closeModal={mockedCloseModal} patientUuid={mockPatient.id} />);
}
