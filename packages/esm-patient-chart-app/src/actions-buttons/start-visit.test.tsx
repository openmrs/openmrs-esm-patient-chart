import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig, usePatient, useVisit } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from 'tools';
import StartVisitOverflowMenuItem from './start-visit.component';

const mockUsePatient = usePatient as jest.Mock;
const mockUseVisit = useVisit as jest.Mock;
const mockUseConfig = useConfig as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  usePatient: jest.fn(),
  useVisit: jest.fn(),
  getGlobalStore: jest.fn(),
  createGlobalStore: jest.fn(),
  createUseStore: jest.fn(),
  useConfig: jest.fn(),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
  };
});

describe('StartVisitOverflowMenuItem', () => {
  it('should launch start visit form', async () => {
    const user = userEvent.setup();
    mockUseConfig.mockReturnValue({ startVisitLabel: '' });
    mockUseVisit.mockReturnValue({ currentVisit: null });
    mockUsePatient.mockReturnValue({ patient: mockPatient });

    render(<StartVisitOverflowMenuItem patientUuid="some-patient-uuid" />);

    const startVisitButton = screen.getByRole('menuitem', { name: /Start visit/ });
    expect(startVisitButton).toBeInTheDocument();

    await user.click(startVisitButton);

    expect(launchPatientWorkspace).toHaveBeenCalledTimes(1);
    expect(launchPatientWorkspace).toHaveBeenCalledWith('start-visit-workspace-form');
  });

  it('should not show start visit button for deceased patient', () => {
    mockUseConfig.mockReturnValue({ startVisitLabel: '' });
    mockUseVisit.mockReturnValue({ currentVisit: null });
    mockUsePatient.mockReturnValue({ patient: { ...mockPatient, deceasedDateTime: '2023-05-07T10:20:30Z' } });

    render(<StartVisitOverflowMenuItem patientUuid="some-patient-uuid" />);

    const startVisitButton = screen.queryByRole('menuitem', { name: /Start visit/ });
    expect(startVisitButton).not.toBeInTheDocument();
  });
});
