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

describe('flags risk count', () => {
  it('displays a single clickable tag', async () => {
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

    const flags = screen.getAllByRole('listitem');
    expect(flags).toHaveLength(3);
    expect(screen.getByText(/patient needs to be followed up/i)).toBeInTheDocument();
    expect(screen.getByText(/diagnosis for the patient is unknown/i)).toBeInTheDocument();
    expect(screen.getByText(/patient has a future appointment scheduled/i)).toBeInTheDocument();

    const editButton = screen.getByRole('button', { name: /edit flags/i });
    expect(editButton).toBeInTheDocument();

    await user.click(editButton);

    expect(mockLaunchWorkspace).toHaveBeenCalledWith('patient-flags-workspace');

    const closeButton = screen.getByRole('button', { name: /close flags list/i });

    await user.click(closeButton);

    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('respects the hideOnPages config', () => {
    mockUseCurrentPath.mockReturnValue('/patient/123/FooBarBaz');
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema<ConfigObject>(configSchema),
      ...getDefaultsFromConfigSchema<FlagsRiskCountExtensionConfig>(riskCountExtensionConfigSchema),
      hideOnPages: ['FooBarBaz'],
    });

    mockUsePatientFlags.mockReturnValue({
      flags: mockPatientFlags,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as unknown as ReturnType<typeof usePatientFlags>);

    render(<FlagsRiskCountExtension patientUuid={mockPatient.id} />);

    // No flags risk count should be shown on the FooBarBaz route
    expect(screen.queryByText(/risk flags/i)).not.toBeInTheDocument();
  });

  it('counts risk flags based on custom priority configuration', () => {
    // Configure 'Info' as the risk priority instead of 'Risk'
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema<ConfigObject>(configSchema),
      ...getDefaultsFromConfigSchema<FlagsRiskCountExtensionConfig>(riskCountExtensionConfigSchema),
      priorities: [
        { priority: 'risk', color: 'high-contrast', isRiskPriority: false },
        { priority: 'info', color: 'orange', isRiskPriority: true },
      ],
    });

    mockUsePatientFlags.mockReturnValue({
      flags: mockPatientFlags,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as unknown as ReturnType<typeof usePatientFlags>);

    render(<FlagsRiskCountExtension patientUuid={mockPatient.id} />);

    // Only 'Future Appointment' has 'Info' priority, so count should be 1
    expect(screen.getByText(/1 risk flag/i)).toBeInTheDocument();
  });

  it('does not render when no flags match configured risk priorities', () => {
    // Configure no priorities as risk
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema<ConfigObject>(configSchema),
      ...getDefaultsFromConfigSchema<FlagsRiskCountExtensionConfig>(riskCountExtensionConfigSchema),
      priorities: [
        { priority: 'risk', color: 'high-contrast', isRiskPriority: false },
        { priority: 'info', color: 'orange', isRiskPriority: false },
      ],
    });

    mockUsePatientFlags.mockReturnValue({
      flags: mockPatientFlags,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as unknown as ReturnType<typeof usePatientFlags>);

    render(<FlagsRiskCountExtension patientUuid={mockPatient.id} />);

    // Should not render anything since no flags are marked as risk
    expect(screen.queryByText(/risk flag/i)).not.toBeInTheDocument();
  });

  it('supports multiple priorities configured as risk', () => {
    // Configure both 'Risk' and 'Info' as risk priorities
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema<ConfigObject>(configSchema),
      ...getDefaultsFromConfigSchema<FlagsRiskCountExtensionConfig>(riskCountExtensionConfigSchema),
      priorities: [
        { priority: 'risk', color: 'high-contrast', isRiskPriority: true },
        { priority: 'info', color: 'orange', isRiskPriority: true },
      ],
    });

    mockUsePatientFlags.mockReturnValue({
      flags: mockPatientFlags,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as unknown as ReturnType<typeof usePatientFlags>);

    render(<FlagsRiskCountExtension patientUuid={mockPatient.id} />);

    // All 3 flags should be counted (2 'Risk' + 1 'Info')
    expect(screen.getByText(/3 risk flags/i)).toBeInTheDocument();
  });
});
