import React from 'react';
import { of, throwError } from 'rxjs';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showSnackbar, updateVisit, useVisit } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '../../__mocks__/visits.mock';
import EndVisitDialog from './end-visit-dialog.component';

const endVisitPayload = {
  location: '6351fcf4-e311-4a19-90f9-35667d99a8af',
  startDatetime: new Date('2021-03-16T08:16:00.000Z'),
  stopDatetime: expect.anything(),
  visitType: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
};

const mockedCloseModal = jest.fn();
const mockedMutate = jest.fn();
const mockedShowSnackbar = jest.mocked(showSnackbar);
const mockedUpdateVisit = jest.mocked(updateVisit);
const mockedUseVisit = jest.mocked(useVisit) as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    showSnackbar: jest.fn(),
    updateVisit: jest.fn(),
  };
});

describe('End visit dialog', () => {
  test('displays a success snackbar when the visit is ended successfully', async () => {
    const user = userEvent.setup();

    mockedUseVisit.mockReturnValue({ currentVisit: mockCurrentVisit, mutate: mockedMutate });
    mockedUpdateVisit.mockReturnValueOnce(
      of({
        status: 200,
        data: {
          visitType: {
            display: 'Facility Visit',
          },
        },
      }),
    );

    renderEndVisitDialog();

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

    expect(updateVisit).toHaveBeenCalledWith(mockCurrentVisit.uuid, endVisitPayload, expect.anything());

    expect(mockedShowSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      subtitle: 'Facility Visit ended successfully',
      kind: 'success',
      title: 'Visit ended',
    });
  });

  test('displays an error snackbar if there was a problem ending a visit', async () => {
    const user = userEvent.setup();

    mockedUseVisit.mockReturnValue({ currentVisit: mockCurrentVisit, mutate: mockedMutate });
    mockedUpdateVisit.mockReturnValueOnce(throwError(new Error('Internal error message')));

    renderEndVisitDialog();

    expect(
      screen.getByText(
        /Ending this visit means that you will no longer be able to add encounters to it. If you need to add an encounter, you can create a new visit for this patient or edit a past one/i,
      ),
    ).toBeInTheDocument();

    const endVisitButton = screen.getByRole('button', { name: /End Visit/i });
    expect(endVisitButton).toBeInTheDocument();

    await user.click(endVisitButton);

    expect(updateVisit).toHaveBeenCalledWith(mockCurrentVisit.uuid, endVisitPayload, expect.anything());

    expect(mockedShowSnackbar).toHaveBeenCalledWith({
      subtitle: 'Internal error message',
      kind: 'error',
      title: 'Error ending visit',
      isLowContrast: false,
    });
  });
});

function renderEndVisitDialog() {
  render(<EndVisitDialog patientUuid="some-patient-uuid" closeModal={mockedCloseModal} />);
}
