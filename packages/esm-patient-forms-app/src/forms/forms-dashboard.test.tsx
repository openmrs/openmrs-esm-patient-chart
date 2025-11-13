import React from 'react';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, type ConfigObject } from '../config-schema';
import { mockCurrentVisit } from '__mocks__';
import FormsDashboard from './forms-dashboard.component';
import { mockPatient } from 'tools';

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);

jest.mock('../hooks/use-forms', () => ({
  useForms: jest.fn().mockReturnValueOnce({
    data: [],
    error: null,
    isValidating: false,
    allForms: [],
  }),
}));

mockUseConfig.mockReturnValue({ ...getDefaultsFromConfigSchema(configSchema), htmlFormEntryForms: [] });

describe('FormsDashboard', () => {
  test('renders an empty state if there are no forms persisted on the server', async () => {
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
