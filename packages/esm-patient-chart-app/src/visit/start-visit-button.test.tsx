import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { launchWorkspace2 } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import StartVisitButton from './start-visit-button.component';

const mockLaunchWorkspace = vi.mocked(launchWorkspace2);

describe('StartVisitButton', () => {
  it('renders the start visit button', () => {
    render(<StartVisitButton patient={mockPatient} patientUuid={mockPatient.id} />);

    expect(screen.getByRole('button', { name: /start visit/i })).toBeInTheDocument();
  });

  it('clicking the button launches the start visit form with the patient-chart group props', async () => {
    const user = userEvent.setup();

    render(<StartVisitButton patient={mockPatient} patientUuid={mockPatient.id} />);

    const startVisitButton = screen.getByRole('button', { name: /start visit/i });
    await user.click(startVisitButton);

    expect(mockLaunchWorkspace).toHaveBeenCalledTimes(1);
    expect(mockLaunchWorkspace).toHaveBeenCalledWith(
      'start-visit-workspace-form',
      { openedFrom: 'patient-chart-start-visit' },
      {},
      {
        patient: mockPatient,
        patientUuid: mockPatient.id,
        visitContext: null,
        mutateVisitContext: null,
      },
    );
  });
});
