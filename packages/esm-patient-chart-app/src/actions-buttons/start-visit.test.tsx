import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import {
  getDefaultsFromConfigSchema,
  useConfig,
  usePatient,
  useVisit,
  type VisitReturnType,
} from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { type ChartConfig, esmPatientChartSchema } from '../config-schema';
import { mockPatient } from 'tools';
import StartVisitOverflowMenuItem from './start-visit.component';

const mockUseConfig = jest.mocked<() => ChartConfig>(useConfig);
const mockUsePatient = jest.mocked(usePatient);
const mockUseVisit = jest.mocked(useVisit);

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  createGlobalStore: jest.fn(),
  createUseStore: jest.fn(),
  getGlobalStore: jest.fn(),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
  };
});

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(esmPatientChartSchema),
});

mockUseVisit.mockReturnValue({
  currentVisit: null,
} as VisitReturnType);

describe('StartVisitOverflowMenuItem', () => {
  it('should launch the start visit form', async () => {
    const user = userEvent.setup();

    mockUsePatient.mockReturnValue({
      error: null,
      isLoading: false,
      patient: mockPatient,
      patientUuid: mockPatient.id,
    });

    render(<StartVisitOverflowMenuItem patientUuid={mockPatient.id} />);

    const startVisitButton = screen.getByRole('menuitem', { name: /start visit/i });
    expect(startVisitButton).toBeInTheDocument();

    await user.click(startVisitButton);
    expect(launchPatientWorkspace).toHaveBeenCalledTimes(1);
    expect(launchPatientWorkspace).toHaveBeenCalledWith('start-visit-workspace-form');
  });

  it('should not show start visit button for a deceased patient', () => {
    mockUsePatient.mockReturnValue({
      error: null,
      isLoading: false,
      patientUuid: mockPatient.id,
      patient: {
        ...mockPatient,
        deceasedDateTime: '2023-05-07T10:20:30Z',
      },
    });

    render(<StartVisitOverflowMenuItem patientUuid={mockPatient.id} />);

    const startVisitButton = screen.queryByRole('menuitem', { name: /start visit/i });
    expect(startVisitButton).not.toBeInTheDocument();
  });
});
