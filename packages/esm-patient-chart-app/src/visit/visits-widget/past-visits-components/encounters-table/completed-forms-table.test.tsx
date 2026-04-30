import React from 'react';
import { screen } from '@testing-library/react';
import { mockPatientAlice } from '__mocks__';
import { renderWithSwr } from 'tools';
import { useAllEncounters } from './encounters-table.resource';
import CompletedFormsTable from './completed-forms-table.component';

jest.mock('./encounters-table.resource', () => ({
  ...jest.requireActual('./encounters-table.resource'),
  useAllEncounters: jest.fn(),
}));

jest.mock('./encounters-table.component', () => {
  return function MockedEncountersTable(props: any) {
    return (
      <div
        data-testid="encounters-table"
        data-is-selectable={props.isSelectable}
        data-show-encounter-type-filter={props.showEncounterTypeFilter}
        data-show-visit-type={props.showVisitType}
        data-total-count={props.totalCount}
      >
        EncountersTable
      </div>
    );
  };
});

const mockUseAllEncounters = jest.mocked(useAllEncounters);

describe('CompletedFormsTable', () => {
  it('renders loading state when encounters are loading', () => {
    mockUseAllEncounters.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    } as any);

    renderWithSwr(<CompletedFormsTable patientUuid={mockPatientAlice.uuid} isTabActive />);

    expect(screen.getByTestId('encounters-table')).toBeInTheDocument();
  });

  it('fetches encounters for the given patient', () => {
    mockUseAllEncounters.mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
    } as any);

    renderWithSwr(<CompletedFormsTable patientUuid={mockPatientAlice.uuid} isTabActive />);

    expect(mockUseAllEncounters).toHaveBeenCalledWith(mockPatientAlice.uuid, undefined);
  });

  it('renders the encounters table with row selection enabled', () => {
    mockUseAllEncounters.mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
    } as any);

    renderWithSwr(<CompletedFormsTable patientUuid={mockPatientAlice.uuid} isTabActive />);

    const table = screen.getByTestId('encounters-table');
    expect(table).toHaveAttribute('data-is-selectable', 'true');
  });

  it('renders the encounters table with the encounter type filter', () => {
    mockUseAllEncounters.mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
    } as any);

    renderWithSwr(<CompletedFormsTable patientUuid={mockPatientAlice.uuid} isTabActive />);

    const table = screen.getByTestId('encounters-table');
    expect(table).toHaveAttribute('data-show-encounter-type-filter', 'true');
  });

  it('renders the encounters table with the visit type column', () => {
    mockUseAllEncounters.mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
    } as any);

    renderWithSwr(<CompletedFormsTable patientUuid={mockPatientAlice.uuid} isTabActive />);

    const table = screen.getByTestId('encounters-table');
    expect(table).toHaveAttribute('data-show-visit-type', 'true');
  });

  it('only includes encounters that have a form with a JSON schema resource', () => {
    const encounterWithJsonSchema = {
      uuid: 'enc-with-schema',
      form: {
        uuid: 'form-1',
        display: 'Form With Schema',
        resources: [{ uuid: 'r1', name: 'JSON schema', valueReference: '{}' }],
      },
      encounterDatetime: '2022-01-18T16:25:27.000+0000',
      encounterType: { uuid: 'type-1', display: 'Admission' },
      obs: [],
      visit: null,
      encounterProviders: [],
    };

    const encounterWithoutSchema = {
      uuid: 'enc-without-schema',
      form: {
        uuid: 'form-2',
        display: 'Form Without Schema',
        resources: [{ uuid: 'r2', name: 'Some other resource', valueReference: '{}' }],
      },
      encounterDatetime: '2022-01-17T10:00:00.000+0000',
      encounterType: { uuid: 'type-1', display: 'Admission' },
      obs: [],
      visit: null,
      encounterProviders: [],
    };

    const encounterWithNoForm = {
      uuid: 'enc-no-form',
      form: null,
      encounterDatetime: '2022-01-16T10:00:00.000+0000',
      encounterType: { uuid: 'type-2', display: 'Visit Note' },
      obs: [],
      visit: null,
      encounterProviders: [],
    };

    mockUseAllEncounters.mockReturnValue({
      data: [encounterWithJsonSchema, encounterWithoutSchema, encounterWithNoForm],
      isLoading: false,
      error: undefined,
    } as any);

    renderWithSwr(<CompletedFormsTable patientUuid={mockPatientAlice.uuid} isTabActive />);

    const table = screen.getByTestId('encounters-table');
    expect(table).toHaveAttribute('data-total-count', '1');
  });
});
