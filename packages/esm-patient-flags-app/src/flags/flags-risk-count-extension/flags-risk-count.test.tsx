import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, launchWorkspace2, useConfig } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import { mockPatientFlags } from '__mocks__';
import { configSchema } from '../../config-schema';
import { riskCountExtensionConfigSchema } from './extension-config-schema';
import { useCurrentPath, usePatientFlags } from '../hooks/usePatientFlags';
import FlagsRiskCountExtension from './flags-risk-count.extension';
import { type ConfigObject } from '../../config-schema';
import { type FlagsRiskCountExtensionConfig } from './extension-config-schema';

const mockUsePatientFlags = jest.mocked(usePatientFlags);
const mockUseCurrentPath = jest.mocked(useCurrentPath);
const mockLaunchWorkspace = jest.mocked(launchWorkspace2);
const mockUseConfig = jest.mocked(useConfig);

jest.mock('../hooks/usePatientFlags', () => {
  const originalModule = jest.requireActual('../hooks/usePatientFlags');

  return {
    ...originalModule,
    usePatientFlags: jest.fn(),
    useCurrentPath: jest.fn(),
  };
});

beforeEach(() => {
  mockUseCurrentPath.mockReturnValue('/patient/123/chart');
  mockUseConfig.mockReturnValue({
    ...getDefaultsFromConfigSchema<ConfigObject>(configSchema),
    ...getDefaultsFromConfigSchema<FlagsRiskCountExtensionConfig>(riskCountExtensionConfigSchema),
  });
});

it('renders a highlights bar showing a summary of the available flags', async () => {
  const user = userEvent.setup();

  mockUsePatientFlags.mockReturnValue({
    flags: mockPatientFlags,
    error: null,
    isLoading: false,
    isValidating: false,
    mutate: jest.fn(),
  } as unknown as ReturnType<typeof usePatientFlags>);

  render(<FlagsRiskCountExtension patientUuid={mockPatient.id} />);

  const riskFlag = screen.getByRole('button', { name: /risk flag/i });
  expect(riskFlag).toBeInTheDocument();
  expect(screen.getByText('🚩')).toBeInTheDocument();
  expect(screen.getByText(/risk flag/)).toBeInTheDocument();

  await user.click(riskFlag);

  const flags = screen.getAllByRole('button', { name: /flag/i });
  expect(flags).toHaveLength(5);
  expect(screen.getByText(/patient needs to be followed up/i)).toBeInTheDocument();
  expect(screen.getByText(/diagnosis for the patient is unknown/i)).toBeInTheDocument();
  expect(screen.getByText(/patient has a future appointment scheduled/i)).toBeInTheDocument();

  const editButton = screen.getByRole('button', { name: /edit/i });
  expect(editButton).toBeInTheDocument();

  await user.click(editButton);

  expect(mockLaunchWorkspace).toHaveBeenCalledWith('patient-flags-workspace');

  const closeButton = screen.getByRole('button', { name: /close flags bar/i });

  await user.click(closeButton);

  expect(screen.getAllByRole('button', { name: /flag/i })).not.toEqual(5);
});

it('suppresses the highlight bar on Patient Summary route', () => {
  mockUseCurrentPath.mockReturnValue('/patient/123/Patient Summary');

  mockUsePatientFlags.mockReturnValue({
    flags: mockPatientFlags,
    error: null,
    isLoading: false,
    isValidating: false,
    mutate: jest.fn(),
  } as unknown as ReturnType<typeof usePatientFlags>);

  render(<FlagsRiskCountExtension patientUuid={mockPatient.id} />);

  // No highlight bar should be shown on the patient summary route
  expect(screen.queryByText(/risk flags/i)).not.toBeInTheDocument();
});
