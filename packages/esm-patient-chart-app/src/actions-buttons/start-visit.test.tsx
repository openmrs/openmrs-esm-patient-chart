import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useVisit } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import StartVisitOverflowMenuItem from './start-visit.component';

const mockUseVisit = useVisit as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  useVisit: jest.fn(),
  getGlobalStore: jest.fn(),
  createGlobalStore: jest.fn(),
  createUseStore: jest.fn(),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
  };
});

describe('StartVisitOverflowMenuItem', () => {
  it('should launch start visit form', () => {
    mockUseVisit.mockReturnValue({ currentVisit: null });
    render(<StartVisitOverflowMenuItem patientUuid="some-patient-uuid" />);

    const startVisitButton = screen.getByRole('menuitem', { name: /Start visit/ });
    expect(startVisitButton).toBeInTheDocument();

    userEvent.click(startVisitButton);

    expect(launchPatientWorkspace).toHaveBeenCalledTimes(1);
    expect(launchPatientWorkspace).toHaveBeenCalledWith('start-visit-workspace-form');
  });
});
