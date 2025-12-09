import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { getDefaultsFromConfigSchema, launchWorkspace2, useConfig } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import { mockPatientFlags } from '__mocks__';
import { type ConfigObject, configSchema } from '../config-schema';
import { usePatientFlags } from './hooks/usePatientFlags';
import FlagsList from './flags-list.component';

type FlagWithPriority = ReturnType<typeof usePatientFlags>['flags'][0];

const mockUsePatientFlags = jest.mocked(usePatientFlags);
const mockLaunchWorkspace = jest.mocked(launchWorkspace2);
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);

jest.mock('./hooks/usePatientFlags', () => {
  const originalModule = jest.requireActual('./hooks/usePatientFlags');

  return {
    ...originalModule,
    usePatientFlags: jest.fn(),
  };
});

it('renders flags in the patient flags slot', async () => {
  const user = userEvent.setup();

  mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(configSchema));
  mockUsePatientFlags.mockReturnValue({
    error: null,
    flags: mockPatientFlags as FlagWithPriority[],
    isLoading: false,
    isValidating: false,
    mutate: jest.fn(),
  });

  render(<FlagsList patientUuid={mockPatient.id} />);

  const flags = screen.getAllByRole('button', { name: /flag/i });
  expect(flags).toHaveLength(3);
  expect(screen.getByText(/patient needs to be followed up/i)).toBeInTheDocument();
  expect(screen.getByText(/diagnosis for the patient is unknown/i)).toBeInTheDocument();
  expect(screen.getByText(/patient has a future appointment scheduled/i)).toBeInTheDocument();

  const editButton = screen.getByRole('button', { name: /edit/i });
  expect(editButton).toBeInTheDocument();

  await user.click(editButton);

  expect(mockLaunchWorkspace).toHaveBeenCalledWith('patient-flags-workspace');
});

it('hides the Edit button when allowFlagDeletion config is false', () => {
  mockUseConfig.mockReturnValue({
    ...getDefaultsFromConfigSchema(configSchema),
    allowFlagDeletion: false,
  });
  mockUsePatientFlags.mockReturnValue({
    error: null,
    flags: mockPatientFlags as FlagWithPriority[],
    isLoading: false,
    isValidating: false,
    mutate: jest.fn(),
  });

  render(<FlagsList patientUuid={mockPatient.id} />);

  const flags = screen.getAllByRole('button', { name: /flag/i });
  expect(flags).toHaveLength(3);

  expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
});
