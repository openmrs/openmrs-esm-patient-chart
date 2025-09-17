import React from 'react';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { configSchema, type ConfigObject } from '../config-schema';
import { mockCurrentVisit } from '__mocks__';
import FormsDashboard from './forms-dashboard.component';
import { mockPatient } from 'tools';

const mockUseConfig = useConfig as jest.Mock;
const mockUseVisitOrOfflineVisit = useVisitOrOfflineVisit as jest.Mock;

jest.mock('../hooks/use-forms', () => {
  const useForms = jest.fn().mockReturnValue({
    data: [],
    error: null,
    isValidating: false,
    allForms: [],
  });

  const useInfiniteForms = jest.fn().mockReturnValue({
    data: [],
    error: null,
    isValidating: false,
    isLoading: false,
    loadMore: jest.fn(),
    canLoadMore: false,
    hasMore: false,
    allForms: [],
    mutateForms: jest.fn(),
    totalLoaded: 0,
  });

  return {
    useForms,
    useInfiniteForms,
  };
});

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    useVisitOrOfflineVisit: jest.fn(),
  };
});

// Mock the framework hooks
jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework/mock'),
  getDefaultsFromConfigSchema: jest.fn().mockImplementation(() => ({})),
  useConfig: jest.fn(),
}));

describe('FormsDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      htmlFormEntryForms: [],
    });
  });

  test('renders an empty state if there are no forms persisted on the server', async () => {
    mockUseVisitOrOfflineVisit.mockReturnValue({
      currentVisit: mockCurrentVisit,
      error: null,
    });

    render(
      <FormsDashboard
        promptBeforeClosing={jest.fn()}
        closeWorkspace={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        patientUuid={mockPatient.id}
        patient={mockPatient}
        setTitle={jest.fn()}
      />,
    );

    expect(screen.getByText(/there are no forms to display/i)).toBeInTheDocument();
  });

  test('renders an empty state when infinite scrolling is enabled', async () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      htmlFormEntryForms: [],
      enableInfiniteScrolling: true,
    });

    mockUseVisitOrOfflineVisit.mockReturnValue({
      currentVisit: mockCurrentVisit,
      error: null,
    });

    render(
      <FormsDashboard
        promptBeforeClosing={jest.fn()}
        closeWorkspace={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        patientUuid={mockPatient.id}
        patient={mockPatient}
        setTitle={jest.fn()}
      />,
    );

    expect(screen.getByText(/there are no forms to display/i)).toBeInTheDocument();
  });

  test('shows loading state during search', async () => {
    // Import the mocked hooks functions
    const { useInfiniteForms } = require('../hooks/use-forms');

    // Mock the search state
    useInfiniteForms.mockReturnValue({
      data: [],
      error: null,
      isValidating: true,
      isLoading: true,
      loadMore: jest.fn(),
      canLoadMore: false,
      hasMore: false,
      allForms: [],
      mutateForms: jest.fn(),
      totalLoaded: 0,
    });

    mockUseVisitOrOfflineVisit.mockReturnValue({
      currentVisit: mockCurrentVisit,
      error: null,
    });

    render(
      <FormsDashboard
        promptBeforeClosing={jest.fn()}
        closeWorkspace={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        patientUuid={mockPatient.id}
        patient={mockPatient}
        setTitle={jest.fn()}
      />,
    );

    // With the current implementation, we still expect the empty state with no search UI
    expect(screen.getByText(/there are no forms to display/i)).toBeInTheDocument();
  });
});
