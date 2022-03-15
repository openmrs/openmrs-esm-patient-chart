import React from 'react';
import { screen, render } from '@testing-library/react';
import CancelVisit from './cancel-visit.component';
import userEvent from '@testing-library/user-event';
import { useVisit, openmrsFetch, showNotification, showToast } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '../../../../../__mocks__/visits.mock';
import * as mockuseVisitDialog from '../useVisitDialog';

const mockUseVisit = useVisit as jest.Mock;
const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockShowNotification = showNotification as jest.Mock;
const mockShowToast = showToast as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useVisit: jest.fn(),
    openmrsFetch: jest.fn(),
  };
});

describe('Cancel Visit', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should cancel an active visit and void all associated encounters', async () => {
    mockUseVisit.mockReturnValue({ currentVisit: mockCurrentVisit, mutate: jest.fn() });
    mockOpenmrsFetch.mockReturnValueOnce(Promise.resolve({ status: 200 }));
    spyOn(mockuseVisitDialog, 'useVisitDialog').and.returnValue({ type: 'cancel' });
    render(<CancelVisit patientUuid="some-uuid" />);

    expect(screen.getByRole('heading', { name: /Cancel active visit/ })).toBeInTheDocument();
    expect(screen.getByText('Canceling this visit will delete all associated encounter(s)')).toBeInTheDocument();

    const cancelVisitButton = screen.getByRole('button', { name: /Cancel Visit/i, exact: true });

    userEvent.click(cancelVisitButton);
    expect(mockOpenmrsFetch).toHaveBeenCalledWith('/ws/rest/v1/visit/some-uuid', {
      body: { voided: true },
      headers: { 'Content-type': 'application/json' },
      method: 'POST',
    });

    const closeModalButton = await screen.findByRole('button', { name: 'Cancel', exact: true });
    userEvent.click(closeModalButton);

    expect(mockShowToast).toHaveBeenCalledWith({
      kind: 'success',
      title: 'Cancel visit',
      description: 'Canceled active visit successfully',
    });
  });

  it('should display an error message when canceling a visit fails', async () => {
    mockUseVisit.mockReturnValue({ currentVisit: mockCurrentVisit, mutate: jest.fn() });
    mockOpenmrsFetch.mockReturnValueOnce(Promise.reject({ status: 500, message: 'Internal server error' }));
    spyOn(mockuseVisitDialog, 'useVisitDialog').and.returnValue({ type: 'cancel' });
    render(<CancelVisit patientUuid="some-uuid" />);

    expect(screen.getByRole('heading', { name: /Cancel active visit/ })).toBeInTheDocument();
    expect(screen.getByText('Canceling this visit will delete all associated encounter(s)')).toBeInTheDocument();

    const cancelVisitButton = screen.getByRole('button', { name: /Cancel Visit/i, exact: true });

    userEvent.click(cancelVisitButton);
    expect(mockOpenmrsFetch).toHaveBeenCalledWith('/ws/rest/v1/visit/some-uuid', {
      body: { voided: true },
      headers: { 'Content-type': 'application/json' },
      method: 'POST',
    });

    const closeModalButton = await screen.findByRole('button', { name: 'Cancel', exact: true });
    userEvent.click(closeModalButton);
    expect(mockShowNotification).toHaveBeenCalledWith({
      critical: true,
      description: 'Internal server error',
      kind: 'error',
      title: 'Error canceling active visit',
    });
  });
});
