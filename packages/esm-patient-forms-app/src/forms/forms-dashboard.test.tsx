import React from 'react';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import {
  type ClinicalFormsWorkspaceWindowProps,
  type PatientWorkspace2DefinitionProps,
} from '@openmrs/esm-patient-common-lib';
import { configSchema, type FormEntryConfigSchema } from '../config-schema';
import FormsDashboard from './forms-dashboard.component';
import { mockPatient } from 'tools';

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

describe('FormsDashboard', () => {
  test('renders an empty state if there are no forms persisted on the server', async () => {
    const defaultProps: PatientWorkspace2DefinitionProps<{}, ClinicalFormsWorkspaceWindowProps> = {
      closeWorkspace: jest.fn(),
      workspaceProps: {},
      windowProps: {
        formEntryWorkspaceName: '',
      },
      groupProps: {
        patientUuid: mockPatient.id,
        patient: mockPatient,
        mutateVisitContext: null,
        visitContext: null,
      },
      workspaceName: '',
      launchChildWorkspace: jest.fn(),
    };

    render(<FormsDashboard {...defaultProps} />);

    expect(screen.getByText(/there are no forms to display/i)).toBeInTheDocument();
  });
});
