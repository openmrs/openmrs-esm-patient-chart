import React from 'react';
import EndVisitDialog from './end-visit-dialog.component';
import { screen, render, waitFor } from '@testing-library/react';
import { showNotification, showToast, updateVisit, useVisit } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '../../../../../__mocks__/visits.mock';
import userEvent from '@testing-library/user-event';
import { of, throwError } from 'rxjs';

const endVisitPayload = {
  location: '6351fcf4-e311-4a19-90f9-35667d99a8af',
  startDatetime: new Date('2021-03-16T08:16:00.000Z'),
  stopDatetime: expect.anything(),
  visitType: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
};

const mockUseVisit = useVisit as jest.Mock;
const mockUpdateVisit = updateVisit as jest.Mock;
const mockShowToast = showToast as jest.Mock;
const mockShowNotification = showNotification as jest.Mock;
const mockMutate = jest.fn();
const mockCloseModal = jest.fn();

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    showToast: jest.fn(),
    showNotification: jest.fn(),
    updateVisit: jest.fn(),
  };
});

describe('EndVisit', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('should end an active visit and display toast message', async () => {
    mockUseVisit.mockReturnValue({ currentVisit: mockCurrentVisit, mutate: mockMutate });
    mockUpdateVisit.mockReturnValueOnce(of({ status: 200 }));
    render(<EndVisitDialog patientUuid="some-patient-uuid" closeModal={mockCloseModal} />);

    expect(screen.getByRole('heading', { name: /End active visit/ })).toBeInTheDocument();
    expect(
      screen.getByText('Ending this visit, will not allow you to fill another encounter form for this patient'),
    ).toBeInTheDocument();

    const endVisitButton = await screen.findByRole('button', { name: /End Visit/i });
    expect(endVisitButton).toBeInTheDocument();

    userEvent.click(endVisitButton);

    expect(updateVisit).toHaveBeenCalledWith(
      '17f512b4-d264-4113-a6fe-160cb38cb46e',
      endVisitPayload,
      expect.anything(),
    );

    expect(mockShowToast).toHaveBeenCalledWith({ description: 'Ended active visit successfully', kind: 'success' });
  });

  test('should display error message when rest api call to end visit fails', async () => {
    mockUseVisit.mockReturnValue({ currentVisit: mockCurrentVisit, mutate: mockMutate });
    mockUpdateVisit.mockReturnValueOnce(throwError(new Error('Internal error message')));
    render(<EndVisitDialog patientUuid="some-patient-uuid" closeModal={mockCloseModal} />);

    expect(screen.getByRole('heading', { name: /End active visit/ })).toBeInTheDocument();
    expect(
      screen.getByText('Ending this visit, will not allow you to fill another encounter form for this patient'),
    ).toBeInTheDocument();

    const endVisitButton = await screen.findByRole('button', { name: /End Visit/i });
    expect(endVisitButton).toBeInTheDocument();

    userEvent.click(endVisitButton);

    expect(updateVisit).toHaveBeenCalledWith(
      '17f512b4-d264-4113-a6fe-160cb38cb46e',
      endVisitPayload,
      expect.anything(),
    );

    expect(mockShowNotification).toHaveBeenCalledWith({
      description: 'Internal error message',
      kind: 'error',
      title: 'Error ending active visit',
      critical: true,
    });
  });
});
