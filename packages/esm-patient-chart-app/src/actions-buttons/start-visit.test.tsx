import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { launchWorkspace } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import StartVisitOverflowMenuItem from './start-visit.component';

const mockLaunchWorkspace = jest.mocked(launchWorkspace);

describe('StartVisitOverflowMenuItem', () => {
  it('should launch the start visit form', async () => {
    const user = userEvent.setup();

    render(<StartVisitOverflowMenuItem patient={mockPatient} />);

    const startVisitButton = screen.getByRole('menuitem', { name: /add visit/i });
    expect(startVisitButton).toBeInTheDocument();

    await user.click(startVisitButton);
    expect(mockLaunchWorkspace).toHaveBeenCalledTimes(1);
    expect(mockLaunchWorkspace).toHaveBeenCalledWith('start-visit-workspace-form', {
      openedFrom: 'patient-chart-start-visit',
    });
  });

  it('should not show start visit button for a deceased patient', () => {
    render(
      <StartVisitOverflowMenuItem
        patient={{
          ...mockPatient,
          deceasedDateTime: '2023-05-07T10:20:30Z',
        }}
      />,
    );

    const startVisitButton = screen.queryByRole('menuitem', { name: /start visit/i });
    expect(startVisitButton).not.toBeInTheDocument();
  });
});
