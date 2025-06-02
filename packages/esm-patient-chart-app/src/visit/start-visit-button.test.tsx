import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { launchWorkspace } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import StartVisitButton from './start-visit-button.component';

const mockLaunchWorkspace = jest.mocked(launchWorkspace);

describe('StartVisitButton', () => {
  it('renders the start visit button', () => {
    render(<StartVisitButton patientUuid={mockPatient.id} />);

    expect(screen.getByRole('button', { name: /start visit/i })).toBeInTheDocument();
  });

  it('clicking the button launches the start visit form', async () => {
    const user = userEvent.setup();

    render(<StartVisitButton patientUuid={mockPatient.id} />);

    const startVisitButton = screen.getByRole('button', { name: /start visit/i });
    await user.click(startVisitButton);

    expect(mockLaunchWorkspace).toHaveBeenCalledTimes(1);
    expect(mockLaunchWorkspace).toHaveBeenCalledWith('start-visit-workspace-form', {
      patientUuid: mockPatient.id,
      openedFrom: 'patient-chart-start-visit',
    });
  });
});
