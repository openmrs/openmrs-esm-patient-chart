import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { showSnackbar, updateVisit, type Visit, type FetchResponse } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '__mocks__';
import EndVisitDialog from './end-visit-dialog.component';

const endVisitPayload = {
  stopDatetime: expect.any(Date),
};

const mockCloseModal = jest.fn();
const mockMutate = jest.fn();
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockUpdateVisit = jest.mocked(updateVisit);

jest.mock('@openmrs/esm-patient-common-lib', () => {
  return {
    usePatientChartStore: () => ({
      visits: {
        activeVisit: mockCurrentVisit,
        currentVisit: mockCurrentVisit,
        currentVisitIsRetrospective: false,
        error: null,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      },
    }),
  };
});

describe('End visit dialog', () => {
  test('displays a success snackbar when the visit is ended successfully', async () => {
    const user = userEvent.setup();

    mockUpdateVisit.mockResolvedValue({
      status: 200,
      data: {
        visitType: {
          display: 'Facility Visit',
        },
      },
    } as unknown as FetchResponse<Visit>);

    render(<EndVisitDialog closeModal={mockCloseModal} />);

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
      screen.getByText(/You can add additional encounters to this visit in the visit summary/i),
    ).toBeInTheDocument();

    await user.click(endVisitButton);

    expect(updateVisit).toHaveBeenCalledWith(mockCurrentVisit.uuid, endVisitPayload, expect.anything());

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

    mockUpdateVisit.mockRejectedValue(error);

    render(<EndVisitDialog closeModal={mockCloseModal} />);

    expect(
      screen.getByText(/You can add additional encounters to this visit in the visit summary/i),
    ).toBeInTheDocument();

    const endVisitButton = screen.getByRole('button', { name: /End Visit/i });
    expect(endVisitButton).toBeInTheDocument();

    await user.click(endVisitButton);

    expect(updateVisit).toHaveBeenCalledWith(mockCurrentVisit.uuid, endVisitPayload, new AbortController());
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      subtitle: 'Internal error message',
      kind: 'error',
      title: 'Error ending visit',
      isLowContrast: false,
    });
  });
});
