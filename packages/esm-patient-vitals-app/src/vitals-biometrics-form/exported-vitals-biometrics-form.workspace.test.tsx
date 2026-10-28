import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ExtensionSlot, getDefaultsFromConfigSchema, useConfig, type Visit } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import { type ConfigObject, configSchema } from '../config-schema';
import ExportedVitalsAndBiometricsForm from './exported-vitals-biometrics-form.workspace';

vi.mock('../common', () => ({
  assessValue: vi.fn(),
  createOrUpdateVitalsAndBiometrics: vi.fn(),
  getReferenceRangesForConcept: vi.fn(),
  interpretBloodPressure: vi.fn(),
  invalidateCachedVitalsAndBiometrics: vi.fn(),
  useConceptUnits: vi.fn().mockImplementation(() => ({ conceptUnits: new Map(), error: null, isLoading: false })),
  useEncounterVitalsAndBiometrics: vi.fn().mockImplementation(() => ({
    isLoading: false,
    vitalsAndBiometrics: null,
    mutate: vi.fn(),
    getRefinedInitialValues: () => ({}),
  })),
}));

vi.mock('../common/data.resource', () => ({
  useVitalsConceptMetadata: vi
    .fn()
    .mockImplementation(() => ({ conceptRanges: new Map(), conceptRangeMap: new Map() })),
}));

const mockExtensionSlot = vi.mocked(ExtensionSlot);
const mockUseConfig = vi.mocked(useConfig);

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  vitals: {
    ...getDefaultsFromConfigSchema(configSchema).vitals,
    useFormEngine: true,
  },
} as ConfigObject);

const defaultProps = {
  closeWorkspace: vi.fn(),
  launchChildWorkspace: vi.fn(),
  workspaceName: 'patient-vitals-biometrics-form-workspace',
  windowName: 'vitals-and-biometrics',
  isRootWorkspace: false,
  showActionMenu: true,
  workspaceProps: {
    formContext: 'creating' as const,
    patientUuid: mockPatient.id,
    patient: mockPatient,
    visitContext: null as unknown as Visit,
    showPatientBanner: true,
  },
  windowProps: {},
  groupProps: {},
};

function getExtensionSlotState(name: string) {
  return mockExtensionSlot.mock.calls.find(([props]) => props.name === name)?.[0]?.state;
}

describe('ExportedVitalsAndBiometricsForm', () => {
  it('renders the patient banner when it is enabled', () => {
    render(<ExportedVitalsAndBiometricsForm {...defaultProps} />);

    expect(getExtensionSlotState('patient-header-slot')).toBeDefined();
  });

  it('hides the form engine patient banner when the workspace renders its own', () => {
    render(<ExportedVitalsAndBiometricsForm {...defaultProps} />);

    expect(getExtensionSlotState('form-widget-slot').hidePatientBanner).toBe(true);
  });

  it('lets the form engine render its own patient banner when the workspace does not render one', () => {
    render(
      <ExportedVitalsAndBiometricsForm
        {...defaultProps}
        workspaceProps={{ ...defaultProps.workspaceProps, showPatientBanner: false }}
      />,
    );

    expect(getExtensionSlotState('patient-header-slot')).toBeUndefined();
    expect(getExtensionSlotState('form-widget-slot').hidePatientBanner).toBe(false);
  });
});
