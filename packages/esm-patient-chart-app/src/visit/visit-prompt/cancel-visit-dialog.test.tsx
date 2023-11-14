import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useVisit, openmrsFetch, showNotification, showToast, FetchResponse } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '../../__mocks__/visits.mock';
import { mockPatient } from '../../../../../tools/test-helpers';
import { mockVisitQueueEntries } from '../../__mocks__/visitQueueEntry.mock';
import { MappedVisitQueueEntry, useVisitQueueEntry } from '../queue-entry/queue.resource';
import { removeQueuedPatient } from '../hooks/useServiceQueue';
import CancelVisitDialog from './cancel-visit-dialog.component';

const mockedCloseModal = jest.fn();
const mockedOpenmrsFetch = jest.mocked(openmrsFetch);
const mockedRemoveQueuedPatient = jest.mocked(removeQueuedPatient);
const mockedShowNotification = jest.mocked(showNotification);
const mockedShowToast = jest.mocked(showToast);
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

    mockedOpenmrsFetch.mockResolvedValueOnce(response as FetchResponse);
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
      body: { voided: true },
      headers: { 'Content-type': 'application/json' },
      method: 'POST',
    });

    expect(mockedShowToast).toHaveBeenCalledWith({
      kind: 'success',
      title: 'Visit cancelled',
      description: 'Active visit cancelled successfully',
    });
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
      body: { voided: true },
      headers: { 'Content-type': 'application/json' },
      method: 'POST',
    });

    expect(mockedShowNotification).toHaveBeenCalledWith({
      critical: true,
      description: 'Internal server error',
      kind: 'error',
      title: 'Error cancelling visit',
    });
  });
});

function renderCancelVisitDialog() {
  render(<CancelVisitDialog closeModal={mockedCloseModal} patientUuid={mockPatient.id} />);
}
