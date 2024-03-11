import React from 'react';
import AddPastVisitOverflowMenuItem from './add-past-visit.component';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

const mockLaunchPatientWorkspace = launchPatientWorkspace as jest.Mock;

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');
  return { originalModule, launchPatientWorkspace: jest.fn() };
});

describe('AddPastVisitOverflowMenuItem', () => {
  it('should launch past visit prompt', async () => {
    const user = userEvent.setup();

    render(<AddPastVisitOverflowMenuItem />);

    const addPastVisitButton = screen.getByRole('menuitem', { name: /Add past visit/ });
    expect(addPastVisitButton).toBeInTheDocument();

    // should launch the form
    await user.click(addPastVisitButton);

    expect(mockLaunchPatientWorkspace).toHaveBeenCalledWith('start-visit-workspace-form', {
      isCreatingVisit: true,
      workspaceTitle: 'Add past visit',
    });
  });
});
