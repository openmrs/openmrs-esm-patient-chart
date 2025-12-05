import React from 'react';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, type FormEntryConfigSchema } from '../config-schema';
import FormsDashboard from './forms-dashboard.component';
import { mockPatient } from 'tools';
import { mockVisit } from '__mocks__';

const mockUseConfig = jest.mocked(useConfig<FormEntryConfigSchema>);

jest.mock('../hooks/use-forms', () => ({
  useForms: jest.fn().mockReturnValue({
    data: [],
    error: null,
    isValidating: false,
    allForms: [],
  }),
  useInfiniteForms: jest.fn().mockReturnValue({
    data: [
      {
        form: {
          uuid: '031e4464-ab80-3424-9137-31e2b45dc2d7',
          name: 'A React demo form',
          display: 'A React demo form',
          encounterType: {
            uuid: 'dd528487-82a5-4082-9c72-ed246bd49591',
            name: 'Consultation',
            viewPrivilege: null,
            editPrivilege: null,
          },
          version: '02.07.12:38(dd.mm.HH)',
          published: true,
          retired: false,
          resources: [
            {
              uuid: '367f3569-54a4-4528-8cf2-2fc5e0fda821',
              name: 'JSON schema',
              dataType: 'AmpathJsonSchema',
              valueReference: '4cad3e5e-f560-4f77-9057-3c7bf0201366',
            },
          ],
        },
        associatedEncounters: [],
      },
      {
        form: {
          uuid: '5fa12f85-1ea7-4aec-960e-08ceba8d9ab6',
          name: 'ANC flowsheet',
          display: 'ANC flowsheet',
          encounterType: {
            uuid: 'a703372d-28b7-4831-9817-ee385c8c47d8',
            name: 'ANC visit',
            viewPrivilege: null,
            editPrivilege: null,
          },
          version: '1.0',
          published: true,
          retired: false,
          resources: [
            {
              uuid: '4e4b93c2-2e02-494b-a1ed-45635704ad73',
              name: 'formEngine',
              dataType: 'org.openmrs.customdatatype.datatype.FreeTextDatatype',
              valueReference: 'htmlformentry',
            },
          ],
        },
        associatedEncounters: [],
      },
    ],
    isError: null,
    isValidating: false,
    isLoading: false,
    loadMore: undefined,
    hasMore: false,
    mutateScrollableForms: jest.fn(),
    isValidatingScrollableForms: false,
    totalLoaded: 0,
  }),
}));

mockUseConfig.mockReturnValue({ ...getDefaultsFromConfigSchema(configSchema), htmlFormEntryForms: [] });

describe('FormsDashboard', () => {
  test('renders an empty state if there are no forms persisted on the server', async () => {
    mockUseConfig.mockReturnValueOnce({
      ...getDefaultsFromConfigSchema(configSchema),
      enableInfiniteScrolling: false,
      htmlFormEntryForms: [],
    });
    render(<FormsDashboard handleFormOpen={jest.fn()} patient={mockPatient} visitContext={null} />);

    expect(screen.getByText(/there are no forms to display/i)).toBeInTheDocument();
  });

  test('renders all forms if infinite scroll is enabled', async () => {
    mockUseConfig.mockReturnValueOnce({
      ...getDefaultsFromConfigSchema(configSchema),
      enableInfiniteScrolling: true,
      htmlFormEntryForms: [],
    });
    render(<FormsDashboard handleFormOpen={jest.fn()} patient={mockPatient} visitContext={mockVisit} />);

    expect(screen.getByText(/A React demo form/i)).toBeInTheDocument();
    expect(screen.getByText(/ANC flowsheet/i)).toBeInTheDocument();
  });
});
