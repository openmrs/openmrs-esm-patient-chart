import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import StartVisitDialog from './start-visit-dialog.component';

const testProps = {
  patientUuid: 'some-uuid',
  closeModal: jest.fn(),
  visitType: null,
};

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
  };
});

describe('StartVisit', () => {
  test('should launch start visit form', async () => {
    const user = userEvent.setup();

    renderStartVisitDialog();

    expect(
      screen.getByText(
        `You can't add data to the patient chart without an active visit. Choose from one of the options below to continue.`,
      ),
    ).toBeInTheDocument();

    const startNewVisitButton = screen.getByRole('button', { name: /Start new visit/i });

    await user.click(startNewVisitButton);

    expect(launchPatientWorkspace).toHaveBeenCalledWith('start-visit-workspace-form');
  });

  test('should launch edit past visit form', async () => {
    const user = userEvent.setup();

    testProps.visitType = 'past';

    renderStartVisitDialog();

    expect(
      screen.getByText(
        `You can add a new past visit or update an old one. Choose from one of the options below to continue.`,
      ),
    ).toBeInTheDocument();

    const editPastVisitButton = screen.getByRole('button', { name: /Edit past visit/i });

    await user.click(editPastVisitButton);

    expect(launchPatientWorkspace).toHaveBeenCalledWith('past-visits-overview');
  });
});

function renderStartVisitDialog() {
  render(<StartVisitDialog {...testProps} />);
}
