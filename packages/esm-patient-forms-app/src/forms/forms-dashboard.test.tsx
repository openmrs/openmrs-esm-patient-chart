import React from 'react';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, type FormEntryConfigSchema } from '../config-schema';
import FormsDashboard from './forms-dashboard.component';
import { mockPatient } from 'tools';

const mockUseConfig = jest.mocked(useConfig<FormEntryConfigSchema>);

jest.mock('../hooks/use-forms', () => ({
  useForms: jest.fn().mockReturnValue({
    data: [],
    error: null,
    isValidating: false,
    allForms: [],
  }),
  useInfiniteForms: jest.fn().mockReturnValue({
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
  }),
}));

mockUseConfig.mockReturnValue({ ...getDefaultsFromConfigSchema(configSchema), htmlFormEntryForms: [] });

describe('FormsDashboard', () => {
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
});
