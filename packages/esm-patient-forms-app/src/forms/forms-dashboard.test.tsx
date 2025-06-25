import React from 'react';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, type FormEntryConfigSchema } from '../config-schema';
import FormsDashboard from './forms-dashboard.component';
import { mockPatient } from 'tools';
import { FormsProvider } from '../hooks/use-forms-context';

const mockUseConfig = jest.mocked(useConfig<FormEntryConfigSchema>);

jest.mock('../hooks/use-forms', () => ({
  useForms: jest.fn().mockReturnValueOnce({
    data: [],
    error: null,
    isValidating: false,
    allForms: [],
  }),
}));

mockUseConfig.mockReturnValue({ ...getDefaultsFromConfigSchema(configSchema), htmlFormEntryForms: [] });
jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    useVisitOrOfflineVisit: jest.fn(),
  };
});

describe('FormsDashboard', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({ ...getDefaultsFromConfigSchema(configSchema), htmlFormEntryForms: [] });
  });

  test('renders an empty state if there are no forms persisted on the server', async () => {
    render(<FormsDashboard handleFormOpen={jest.fn()} patient={mockPatient} visitContext={null} />);

    expect(screen.getByText(/there are no forms to display/i)).toBeInTheDocument();
  });
});
