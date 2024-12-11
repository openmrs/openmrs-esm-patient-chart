import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { showSnackbar, updateVisit, useVisit, type Visit, type FetchResponse } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '__mocks__';
import EndVisitDialog from './end-visit-dialog.component';

const mockCloseModal = jest.fn();
const mockMutate = jest.fn();
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockUseVisit = jest.mocked(useVisit);
const mockUpdateVisit = jest.mocked(updateVisit);

describe('End visit dialog', () => {
  beforeEach(() => {
    mockUseVisit.mockReturnValue({
      activeVisit: mockCurrentVisit,
      currentVisit: mockCurrentVisit,
      currentVisitIsRetrospective: false,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: mockMutate,
    });
  });

  test('displays a success snackbar when the visit is ended successfully', async () => {
    const user = userEvent.setup();
    const mockCurrentTime = new Date('2024-12-11T01:20:25.1234');
    const mockCurrentTimeTruncated = new Date('2024-12-11T01:20:00');
    mockUpdateVisit.mockResolvedValue({
      status: 200,
      data: {
        visitType: {
          display: 'Facility Visit',
        },
      },
    } as unknown as FetchResponse<Visit>);

    const expectedEndVisitPayload = {
      stopDatetime: mockCurrentTimeTruncated,
    };

    render(
      <EndVisitDialog patientUuid="some-patient-uuid" closeModal={mockCloseModal} stopDatetime={mockCurrentTime} />,
    );

    const closeModalButton = screen.getByRole('button', { name: /close/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const endVisitButton = screen.getByRole('button', { name: /end visit/i });

    expect(closeModalButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
    expect(endVisitButton).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /are you sure you want to end this active visit?/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Ending this visit means that you will no longer be able to add encounters to it. If you need to add an encounter, you can create a new visit for this patient or edit a past one/i,
      ),
    ).toBeInTheDocument();

    await user.click(endVisitButton);

    expect(updateVisit).toHaveBeenCalledWith(mockCurrentVisit.uuid, expectedEndVisitPayload, expect.anything());

    expect(mockShowSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      subtitle: 'Facility Visit ended successfully',
      kind: 'success',
      title: 'Visit ended',
    });
  });

  test('displays an error snackbar if there was a problem ending a visit', async () => {
    const user = userEvent.setup();

    const error = {
      message: 'Internal error message',
      response: {
        status: 500,
        statusText: 'Internal server error',
      },
    };

    const expectedEndVisitPayload = {
      stopDatetime: expect.any(Date),
    };

    mockUpdateVisit.mockRejectedValue(error);

    render(<EndVisitDialog patientUuid="some-patient-uuid" closeModal={mockCloseModal} />);

    expect(
      screen.getByText(
        /Ending this visit means that you will no longer be able to add encounters to it. If you need to add an encounter, you can create a new visit for this patient or edit a past one/i,
      ),
    ).toBeInTheDocument();

    const endVisitButton = screen.getByRole('button', { name: /End Visit/i });
    expect(endVisitButton).toBeInTheDocument();

    await user.click(endVisitButton);

    expect(updateVisit).toHaveBeenCalledWith(mockCurrentVisit.uuid, expectedEndVisitPayload, new AbortController());
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      subtitle: 'Internal error message',
      kind: 'error',
      title: 'Error ending visit',
      isLowContrast: false,
    });
  });
});
