import React from 'react';
import { vi, describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, type FormEntryConfigSchema } from '../config-schema';
import FormsDashboard from './forms-dashboard.component';
import { mockPatient } from 'tools';

const mockUseConfig = vi.mocked(useConfig<FormEntryConfigSchema>);

vi.mock('../hooks/use-forms', () => ({
  useForms: vi.fn().mockReturnValueOnce({
    data: [],
    error: null,
    isValidating: false,
    allForms: [],
  }),
}));

mockUseConfig.mockReturnValue({ ...getDefaultsFromConfigSchema(configSchema), htmlFormEntryForms: [] });

describe('FormsDashboard', () => {
  test('renders an empty state if there are no forms persisted on the server', async () => {
    render(<FormsDashboard handleFormOpen={vi.fn()} patient={mockPatient} visitContext={null} />);

    expect(screen.getByText(/there are no forms to display/i)).toBeInTheDocument();
  });
});
