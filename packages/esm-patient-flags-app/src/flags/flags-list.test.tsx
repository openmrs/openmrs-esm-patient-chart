import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { getDefaultsFromConfigSchema, launchWorkspace2, navigate, useConfig } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import { mockPatientFlags } from '__mocks__';
import { type ConfigObject, configSchema } from '../config-schema';
import { usePatientFlags } from './hooks/usePatientFlags';
import FlagsList from './flags-list.component';

type FlagWithPriority = ReturnType<typeof usePatientFlags>['flags'][0];

const mockUsePatientFlags = jest.mocked(usePatientFlags);
const mockLaunchWorkspace = jest.mocked(launchWorkspace2);
const mockNavigate = jest.mocked(navigate);
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);

jest.mock('./hooks/usePatientFlags', () => {
  const originalModule = jest.requireActual('./hooks/usePatientFlags');

  return {
    ...originalModule,
    usePatientFlags: jest.fn(),
  };
});

describe('flags list', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('flags list displays flags and edit button', async () => {
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

    const flags = screen.getAllByRole('listitem');
    expect(flags).toHaveLength(3);
    expect(screen.getByText(/patient needs to be followed up/i)).toBeInTheDocument();
    expect(screen.getByText(/diagnosis for the patient is unknown/i)).toBeInTheDocument();
    expect(screen.getByText(/patient has a future appointment scheduled/i)).toBeInTheDocument();

    const editButton = screen.getByRole('button', { name: /edit flags/i });
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

    const flags = screen.getAllByRole('listitem');
    expect(flags).toHaveLength(3);

    expect(screen.queryByRole('button', { name: /edit flags/i })).not.toBeInTheDocument();
  });

  it('filters flags by tag display name when filterByTags is provided', () => {
    mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(configSchema));
    mockUsePatientFlags.mockReturnValue({
      error: null,
      flags: mockPatientFlags as FlagWithPriority[],
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });

    // Filter to only show flags with 'flag type - Clinical' tag
    render(<FlagsList patientUuid={mockPatient.id} filterByTags={['flag type - Clinical']} />);

    const flags = screen.getAllByRole('listitem');
    // Only 2 flags have 'flag type - Clinical' tag (Unknown Diagnosis and Future Appointment)
    expect(flags).toHaveLength(2);
    expect(screen.queryByText(/patient needs to be followed up/i)).not.toBeInTheDocument();
    expect(screen.getByText(/diagnosis for the patient is unknown/i)).toBeInTheDocument();
    expect(screen.getByText(/patient has a future appointment scheduled/i)).toBeInTheDocument();
  });

  it('filters flags by tag uuid when filterByTags is provided', () => {
    mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(configSchema));
    mockUsePatientFlags.mockReturnValue({
      error: null,
      flags: mockPatientFlags as FlagWithPriority[],
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });

    // Filter by the uuid of 'flag tag - risk' which only belongs to 'Needs Follow Up'
    render(<FlagsList patientUuid={mockPatient.id} filterByTags={['some-uuid']} />);

    const flags = screen.getAllByRole('listitem');
    expect(flags).toHaveLength(1);
    expect(screen.getByText(/patient needs to be followed up/i)).toBeInTheDocument();
  });

  it('launches workspace when flag with configured flagAction is clicked', async () => {
    const user = userEvent.setup();

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      flagActions: [{ flagName: 'Needs Follow Up', workspace: 'test-workspace' }],
    });
    mockUsePatientFlags.mockReturnValue({
      error: null,
      flags: mockPatientFlags as FlagWithPriority[],
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });

    render(<FlagsList patientUuid={mockPatient.id} />);

    // The flag with action should be a button (OperationalTag)
    const clickableFlag = screen.getByRole('button', { name: /patient needs to be followed up/i });
    expect(clickableFlag).toBeInTheDocument();

    await user.click(clickableFlag);

    expect(mockLaunchWorkspace).toHaveBeenCalledWith('test-workspace');
  });

  it('navigates to URL when flag with configured flagAction URL is clicked', async () => {
    const user = userEvent.setup();

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      flagActions: [{ flagName: 'Needs Follow Up', url: '/patient/${patientUuid}/follow-up' }],
    });
    mockUsePatientFlags.mockReturnValue({
      error: null,
      flags: mockPatientFlags as FlagWithPriority[],
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });

    render(<FlagsList patientUuid={mockPatient.id} />);

    const clickableFlag = screen.getByRole('button', { name: /patient needs to be followed up/i });
    await user.click(clickableFlag);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/patient/${patientUuid}/follow-up',
      templateParams: { patientUuid: mockPatient.id },
    });
  });

  it('launches workspace when flag with matching tagAction is clicked', async () => {
    const user = userEvent.setup();

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      tagActions: [{ tagName: 'flag type - Clinical', workspace: 'clinical-workspace' }],
    });
    mockUsePatientFlags.mockReturnValue({
      error: null,
      flags: mockPatientFlags as FlagWithPriority[],
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });

    render(<FlagsList patientUuid={mockPatient.id} />);

    // 'Unknown Diagnosis' has 'flag type - Clinical' tag
    const clickableFlag = screen.getByRole('button', { name: /diagnosis for the patient is unknown/i });
    await user.click(clickableFlag);

    expect(mockLaunchWorkspace).toHaveBeenCalledWith('clinical-workspace');
  });

  it('flagAction takes precedence over tagAction', async () => {
    const user = userEvent.setup();

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      flagActions: [{ flagName: 'Unknown Diagnosis', workspace: 'flag-specific-workspace' }],
      tagActions: [{ tagName: 'flag type - Clinical', workspace: 'tag-workspace' }],
    });
    mockUsePatientFlags.mockReturnValue({
      error: null,
      flags: mockPatientFlags as FlagWithPriority[],
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });

    render(<FlagsList patientUuid={mockPatient.id} />);

    // 'Unknown Diagnosis' has both a flagAction and a matching tagAction
    const clickableFlag = screen.getByRole('button', { name: /diagnosis for the patient is unknown/i });
    await user.click(clickableFlag);

    // flagAction should take precedence
    expect(mockLaunchWorkspace).toHaveBeenCalledWith('flag-specific-workspace');
    expect(mockLaunchWorkspace).not.toHaveBeenCalledWith('tag-workspace');
  });

  it('displays flag icon for flags with isRiskPriority set to true', () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      priorities: [
        { priority: 'risk', color: 'high-contrast', isRiskPriority: true },
        { priority: 'info', color: 'orange', isRiskPriority: false },
      ],
    });
    mockUsePatientFlags.mockReturnValue({
      error: null,
      flags: mockPatientFlags as FlagWithPriority[],
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });

    render(<FlagsList patientUuid={mockPatient.id} />);

    // 'Needs Follow Up' and 'Unknown Diagnosis' have 'Risk' priority
    // 'Future Appointment' has 'Info' priority
    const flagIcons = screen.getAllByText('🚩');
    expect(flagIcons).toHaveLength(2);
  });

  it('uses custom priority color from config', () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      priorities: [
        { priority: 'risk', color: 'red', isRiskPriority: true },
        { priority: 'info', color: 'blue', isRiskPriority: false },
      ],
    });
    mockUsePatientFlags.mockReturnValue({
      error: null,
      flags: mockPatientFlags as FlagWithPriority[],
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });

    render(<FlagsList patientUuid={mockPatient.id} />);

    // Check that flags are rendered (the actual color is applied via Carbon's type prop)
    const flags = screen.getAllByRole('listitem');
    expect(flags).toHaveLength(3);
  });

  it('falls back to default priority config when flag priority is not configured', () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      priorities: [], // No priorities configured
    });
    mockUsePatientFlags.mockReturnValue({
      error: null,
      flags: mockPatientFlags as FlagWithPriority[],
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });

    render(<FlagsList patientUuid={mockPatient.id} />);

    // Should still render without crashing, using default orange/non-risk
    const flags = screen.getAllByRole('listitem');
    expect(flags).toHaveLength(3);
    // No flag icons should appear since default isRiskPriority is false
    expect(screen.queryByText('🚩')).not.toBeInTheDocument();
  });
});
