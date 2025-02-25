import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { mockPatient } from 'tools';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import StartVisitButton from './start-visit-button.component';

const mockLaunchPatientWorkspace = jest.mocked(launchPatientWorkspace);

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  launchPatientWorkspace: jest.fn(),
}));

describe('StartVisitButton', () => {
  it('renders the start visit button', () => {
    render(<StartVisitButton patientUuid={mockPatient.id} handleBackToSearchList={() => {}} />);

    expect(screen.getByRole('button', { name: /start visit/i })).toBeInTheDocument();
  });

  it('clicking the button launches the start visit form', async () => {
    const user = userEvent.setup();

    render(<StartVisitButton patientUuid={mockPatient.id} handleBackToSearchList={() => {}} />);

    const startVisitButton = screen.getByRole('button', { name: /start visit/i });
    await user.click(startVisitButton);

    expect(mockLaunchPatientWorkspace).toHaveBeenCalledTimes(1);
    expect(mockLaunchPatientWorkspace).toHaveBeenCalledWith('start-visit-workspace-form', {
      patientUuid: mockPatient.id,
      openedFrom: 'patient-chart-start-visit',
      handleBackToSearchList: expect.any(Function),
    });
  });
});
