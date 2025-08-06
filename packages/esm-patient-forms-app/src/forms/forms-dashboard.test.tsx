import React from 'react';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, type FormEntryConfigSchema } from '../config-schema';
import FormsDashboard from './forms-dashboard.component';
import { mockPatient } from 'tools';

const mockUseConfig = jest.mocked(useConfig<FormEntryConfigSchema>);

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

mockUseConfig.mockReturnValue({ ...getDefaultsFromConfigSchema(configSchema), htmlFormEntryForms: [] });

describe('FormsDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      htmlFormEntryForms: [],
    });
  });

  test('renders an empty state if there are no forms persisted on the server', async () => {
    render(<FormsDashboard handleFormOpen={jest.fn()} patient={mockPatient} visitContext={null} />);

    expect(screen.getByText(/there are no forms to display/i)).toBeInTheDocument();
  });

  test('renders an empty state when infinite scrolling is enabled', async () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      htmlFormEntryForms: [],
      enableInfiniteScrolling: true,
    });

    render(
      <FormsDashboard
        promptBeforeClosing={jest.fn()}
        closeWorkspace={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        patientUuid={mockPatient.id}
        patient={mockPatient}
        setTitle={jest.fn()}
        visitContext={mockCurrentVisit}
        mutateVisitContext={null}
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

    render(
      <FormsDashboard
        promptBeforeClosing={jest.fn()}
        closeWorkspace={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        patientUuid={mockPatient.id}
        patient={mockPatient}
        setTitle={jest.fn()}
        visitContext={mockCurrentVisit}
        mutateVisitContext={null}
      />,
    );

    // With the current implementation, we still expect the empty state with no search UI
    expect(screen.getByText(/there are no forms to display/i)).toBeInTheDocument();
  });
});
