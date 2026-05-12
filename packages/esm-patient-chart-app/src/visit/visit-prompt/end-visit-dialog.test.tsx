import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { showSnackbar, updateVisit, useVisit, type Visit, type FetchResponse } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '__mocks__';
import EndVisitDialog from './end-visit-dialog.modal';
import { usePatientChartStore } from '@openmrs/esm-patient-common-lib';

const endVisitPayload = {
  stopDatetime: expect.any(Date),
};

const mockCloseModal = vi.fn();
const mockMutate = vi.fn();
const mockShowSnackbar = vi.mocked(showSnackbar);
const mockUseVisit = vi.mocked(useVisit);
const mockUpdateVisit = vi.mocked(updateVisit);

const mockUsePatientChartStore = vi.mocked(usePatientChartStore);
const mockSetVisitContext = vi.fn();

vi.mock('@openmrs/esm-patient-common-lib', () => ({
  usePatientChartStore: vi.fn(),
}));

mockUsePatientChartStore.mockReturnValue({
  patientUuid: 'patient-123',
  patient: null,
  visitContext: mockCurrentVisit,
  mutateVisitContext: vi.fn(),
  setPatient: vi.fn(),
  setVisitContext: mockSetVisitContext,
});

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

    mockUpdateVisit.mockResolvedValue({
      status: 200,
      data: {
        visitType: {
          display: 'Facility Visit',
        },
      },
    } as unknown as FetchResponse<Visit>);

    render(<EndVisitDialog patientUuid="some-patient-uuid" closeModal={mockCloseModal} />);

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

    expect(mockSetVisitContext).toHaveBeenCalledTimes(1);
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

    render(<EndVisitDialog patientUuid="some-patient-uuid" closeModal={mockCloseModal} />);

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
