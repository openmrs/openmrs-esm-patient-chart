import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  getDefaultsFromConfigSchema,
  useConfig,
  useEmrConfiguration,
  useLocations,
  useVisitTypes,
  userHasAccess,
  type FetchResponse,
 type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { mockLocations, mockVisitTypes } from '__mocks__';
import { mockPatient } from 'tools';
import { type ChartConfig, esmPatientChartSchema } from '../../config-schema';
import {
  createVisitAttribute,
  deleteVisitAttribute,
  updateVisitAttribute,
  useVisitFormCallbacks,
} from './visit-form.resource';
import ExportedVisitForm, { type ExportedVisitFormProps } from './exported-visit-form.workspace';

const mockCloseWorkspace = jest.fn();
const mockUseConfig = jest.mocked(useConfig<ChartConfig>);
const mockUseVisitTypes = jest.mocked(useVisitTypes);
const mockUseLocations = jest.mocked(useLocations);
const mockUseEmrConfiguration = jest.mocked(useEmrConfiguration);
const mockUserHasAccess = jest.mocked(userHasAccess);

jest.mocked(useVisitFormCallbacks).mockReturnValue([new Map(), jest.fn()]);
jest.mocked(createVisitAttribute).mockResolvedValue({} as unknown as FetchResponse);
jest.mocked(updateVisitAttribute).mockResolvedValue({} as unknown as FetchResponse);
jest.mocked(deleteVisitAttribute).mockResolvedValue({} as unknown as FetchResponse);

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  useActivePatientEnrollment: jest.fn().mockReturnValue({
    activePatientEnrollment: [],
    isLoading: false,
  }),
}));

jest.mock('../hooks/useVisitAttributeType', () => ({
  useVisitAttributeType: jest.fn(() => ({
    isLoading: false,
    error: null,
    data: null,
  })),
  useVisitAttributeTypes: jest.fn(() => ({
    isLoading: false,
    error: null,
    visitAttributeTypes: [],
  })),
  useConceptAnswersForVisitAttributeType: jest.fn(() => ({
    isLoading: false,
    error: null,
    answers: [],
  })),
}));

jest.mock('../hooks/useDefaultFacilityLocation', () => ({
  ...jest.requireActual('../hooks/useDefaultFacilityLocation'),
  useDefaultFacilityLocation: jest.fn(() => ({
    defaultFacility: null,
    isLoading: false,
    error: null,
  })),
}));

// Stable reference to avoid infinite re-renders from useMemo dependency changes
const stableDefaultVisitLocation = { display: 'Outpatient Clinic', uuid: 'location-a' };

jest.mock('../hooks/useDefaultVisitLocation', () => ({
  ...jest.requireActual('../hooks/useDefaultVisitLocation'),
  useDefaultVisitLocation: jest.fn(() => stableDefaultVisitLocation),
}));

jest.mock('./visit-form.resource', () => {
  const requireActual = jest.requireActual('./visit-form.resource');
  return {
    ...requireActual,
    useVisitFormCallbacks: jest.fn(),
    createVisitAttribute: jest.fn(),
    updateVisitAttribute: jest.fn(),
    deleteVisitAttribute: jest.fn(),
  };
});

const defaultProps: Workspace2DefinitionProps<ExportedVisitFormProps, {}, {}> = {
  closeWorkspace: mockCloseWorkspace,
  workspaceProps: {
    openedFrom: 'test',
    patient: mockPatient,
    patientUuid: mockPatient.id,
    visitContext: null,
  },
  groupProps: {},
  workspaceName: '',
  launchChildWorkspace: jest.fn(),
  windowName: '',
  isRootWorkspace: false,
  showActionMenu: true,
  windowProps: {},
};

describe('ExportedVisitForm – RDE privilege-based retrospective toggle', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientChartSchema),
    });
    mockUseVisitTypes.mockReturnValue(mockVisitTypes);
    mockUseLocations.mockReturnValue(mockLocations);
    mockUseEmrConfiguration.mockReturnValue({
      emrConfiguration: {
        atFacilityVisitType: null,
      },
      isLoadingEmrConfiguration: false,
      errorFetchingEmrConfiguration: null,
      mutateEmrConfiguration: null,
    });
  });

  it('hides the retrospective "In the past" toggle for users without the RDE privilege', () => {
    mockUserHasAccess.mockReturnValue(false);

    renderExportedVisitForm();

    expect(screen.getByRole('tab', { name: /new/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /ongoing/i })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /in the past/i })).not.toBeInTheDocument();
  });

  it('shows the retrospective "In the past" toggle for users with the RDE privilege', () => {
    mockUserHasAccess.mockReturnValue(true);

    renderExportedVisitForm();

    expect(screen.getByRole('tab', { name: /new/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /ongoing/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /in the past/i })).toBeInTheDocument();
  });

  it('reflects privilege changes on rerender – removes the retrospective toggle when access is revoked', () => {
    mockUserHasAccess.mockReturnValue(true);

    const { rerender } = render(<ExportedVisitForm {...defaultProps} />);

    // Initially all three tabs are visible
    expect(screen.getByRole('tab', { name: /in the past/i })).toBeInTheDocument();

    // Simulate privilege revocation
    mockUserHasAccess.mockReturnValue(false);
    rerender(<ExportedVisitForm {...defaultProps} />);

    expect(screen.getByRole('tab', { name: /new/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /ongoing/i })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /in the past/i })).not.toBeInTheDocument();
  });
});

function renderExportedVisitForm() {
  return render(<ExportedVisitForm {...defaultProps} />);
}
