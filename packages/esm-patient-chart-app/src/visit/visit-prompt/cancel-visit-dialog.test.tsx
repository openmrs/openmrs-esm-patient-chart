import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useVisit, openmrsFetch, showNotification, showToast } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '../../__mocks__/visits.mock';
import { mockPatient } from '../../../../../tools/test-helpers';
import { mockVisitQueueEntries } from '../../__mocks__/visitQueueEntry.mock';
import { useVisitQueueEntry } from '../queue-entry/queue.resource';
import { removeQueuedPatient } from '../hooks/useServiceQueue';
import CancelVisitDialog from './cancel-visit-dialog.component';

const mockUseVisit = useVisit as jest.Mock;
const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockShowNotification = showNotification as jest.Mock;
const mockShowToast = showToast as jest.Mock;
const mockCloseModal = jest.fn();
const mockUseVisitQueueEntry = useVisitQueueEntry as jest.Mock;
const mockRemoveQueuedPatient = removeQueuedPatient as jest.Mock;

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
  it('cancels an active visit and voids all associated encounters', async () => {
    const user = userEvent.setup();

    mockUseVisit.mockReturnValue({ currentVisit: mockCurrentVisit, mutate: jest.fn() });
    mockOpenmrsFetch.mockResolvedValueOnce({ status: 200 });
    mockUseVisitQueueEntry.mockReturnValueOnce({
      queueEntry: mockVisitQueueEntries,
      isLoading: false,
      error: false,
      isValidating: false,
    });
    mockRemoveQueuedPatient.mockResolvedValue({ status: 200 });

    renderCancelVisitDialog();

    expect(screen.getByRole('heading', { name: /Cancel active visit/i })).toBeInTheDocument();
    expect(screen.getByText(/Cancelling this visit will delete all associated encounters/i)).toBeInTheDocument();

    const cancelVisitButton = screen.getByRole('button', { name: /Cancel visit/i, exact: true });

    // TODO: Will be fixed after the solution is finalized
    // await waitFor(() => user.click(cancelVisitButton));

    // expect(mockOpenmrsFetch).toHaveBeenCalledWith('/ws/rest/v1/visit/17f512b4-d264-4113-a6fe-160cb38cb46e', {
    //   body: { voided: true },
    //   headers: { 'Content-type': 'application/json' },
    //   method: 'POST',
    // });

    // expect(mockShowToast).toHaveBeenCalledWith({
    //   kind: 'success',
    //   title: 'Cancel visit',
    //   description: 'Canceled active visit successfully',
    // });
  });

  it('displays an error message when cancelling a visit fails', async () => {
    const user = userEvent.setup();

    mockUseVisit.mockReturnValue({ currentVisit: mockCurrentVisit, mutate: jest.fn() });
    mockOpenmrsFetch.mockRejectedValueOnce({ message: 'Internal server error', status: 500 });
    mockUseVisitQueueEntry.mockReturnValueOnce({ queueEntry: {}, isLoading: false, error: true, isValidating: false });
    mockRemoveQueuedPatient.mockResolvedValue({ status: 200 });

    renderCancelVisitDialog();

    expect(screen.getByRole('heading', { name: /Cancel active visit/i })).toBeInTheDocument();
    expect(screen.getByText(/Cancelling this visit will delete all associated encounters/i)).toBeInTheDocument();

    const cancelVisitButton = screen.getByRole('button', { name: /Cancel visit/i, exact: true });

    // TODO: Will be fixed after the solution is finalized

    // await waitFor(() => user.click(cancelVisitButton));

    // expect(mockOpenmrsFetch).toHaveBeenCalledWith('/ws/rest/v1/visit/17f512b4-d264-4113-a6fe-160cb38cb46e', {
    //   body: { voided: true },
    //   headers: { 'Content-type': 'application/json' },
    //   method: 'POST',
    // });

    // expect(mockShowNotification).toHaveBeenCalledWith({
    //   critical: true,
    //   description: 'Internal server error',
    //   kind: 'error',
    //   title: 'Error cancelling active visit',
    // });
  });
});

function renderCancelVisitDialog() {
  render(<CancelVisitDialog closeModal={mockCloseModal} patientUuid={mockPatient.id} />);
}
