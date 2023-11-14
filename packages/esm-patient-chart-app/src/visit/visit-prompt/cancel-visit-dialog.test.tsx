import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  useVisit,
  openmrsFetch,
  showNotification,
  showToast,
  showActionableNotification,
} from '@openmrs/esm-framework';
import { mockCurrentVisit } from '../../__mocks__/visits.mock';
import { mockPatient } from '../../../../../tools/test-helpers';
import { mockVisitQueueEntries } from '../../__mocks__/visitQueueEntry.mock';
import { MappedVisitQueueEntry, useVisitQueueEntry } from '../queue-entry/queue.resource';
import { removeQueuedPatient } from '../hooks/useServiceQueue';
import CancelVisitDialog from './cancel-visit-dialog.component';

const mockUseVisit = useVisit as jest.Mock;
const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockShowActionableNotification = showActionableNotification as jest.Mock;
const mockShowNotification = showNotification as jest.Mock;
const mockCloseModal = jest.fn();
const mockUseVisitQueueEntry = useVisitQueueEntry as jest.Mock;
const mockRemoveQueuedPatient = removeQueuedPatient as jest.Mock;
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

    mockUseVisit.mockReturnValue({ currentVisit: mockCurrentVisit, mutate: jest.fn() });
    mockOpenmrsFetch.mockResolvedValue({ status: 200 });
    mockUseVisitQueueEntry.mockReturnValueOnce({
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

    expect(mockOpenmrsFetch).toHaveBeenCalledWith('/ws/rest/v1/visit/17f512b4-d264-4113-a6fe-160cb38cb46e', {
      method: 'DELETE',
    });

    expect(mockOpenmrsFetch).toHaveBeenCalledWith('/ws/rest/v1/visit/17f512b4-d264-4113-a6fe-160cb38cb46e', {
      method: 'DELETE',
    });

    expect(mockedShowToast).toHaveBeenCalledWith({
      kind: 'success',
      title: 'Visit cancelled',
      description: 'Active visit cancelled successfully',
    });
  });

  it('displays an error notification if there was problem with cancelling a visit', async () => {
    const user = userEvent.setup();

    mockUseVisit.mockReturnValue({ currentVisit: mockCurrentVisit, mutate: jest.fn() });
    mockOpenmrsFetch.mockRejectedValue({ message: 'Internal server error', status: 500 });
    mockUseVisitQueueEntry.mockReturnValueOnce({ queueEntry: {}, isLoading: false, error: true, isValidating: false });
    mockRemoveQueuedPatient.mockResolvedValue({ status: 200 });

    renderCancelVisitDialog();

    const cancelButton = screen.getByRole('button', { name: /^cancel$/i });
    const cancelVisitButton = screen.getByRole('button', { name: /cancel visit$/i });
    const closeModalButton = screen.getByRole('button', { name: /close/i });

    expect(cancelButton).toBeInTheDocument();
    expect(cancelVisitButton).toBeInTheDocument();
    expect(closeModalButton).toBeInTheDocument();
    expect(screen.getByText(/Cancelling this visit will delete its associated encounters/i)).toBeInTheDocument();

    await user.click(cancelVisitButton);

    expect(mockOpenmrsFetch).toHaveBeenCalledWith('/ws/rest/v1/visit/17f512b4-d264-4113-a6fe-160cb38cb46e', {
      method: 'DELETE',
    });

    expect(mockShowNotification).toHaveBeenCalledWith({
      description: 'An error occured when deleting visit',
      kind: 'error',
      title: 'Error deleting visit',
    });
  });
});

function renderCancelVisitDialog() {
  render(<CancelVisitDialog closeModal={mockedCloseModal} patientUuid={mockPatient.id} />);
}
