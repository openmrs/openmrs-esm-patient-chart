import React from 'react';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, launchWorkspace, useConfig } from '@openmrs/esm-framework';
import { useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { configSchema, type ConfigObject } from '../config-schema';
import { mockCurrentVisit } from '__mocks__';
import FormsDashboard from './forms-dashboard.component';
import { mockPatient } from 'tools';

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockLaunchWorkspace = jest.mocked(launchWorkspace);
const mockUseVisitOrOfflineVisit = useVisitOrOfflineVisit as jest.Mock;

jest.mock('../hooks/use-forms', () => ({
  useForms: jest.fn().mockReturnValueOnce({
    data: [],
    error: null,
    isValidating: false,
    allForms: [],
  }),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    useVisitOrOfflineVisit: jest.fn(),
  };
});

mockUseConfig.mockReturnValue({ ...getDefaultsFromConfigSchema(configSchema), htmlFormEntryForms: [] });

describe('FormsDashboard', () => {
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
});
