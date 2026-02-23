import React from 'react';
import { screen } from '@testing-library/react';
import { useAllEncounters } from './encounters-table.resource';
import CompletedFormsTable from './completed-forms-table-component';
import { renderWithSwr } from 'tools';
import { mockPatientAlice } from '__mocks__';

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
      >
        EncountersTable
      </div>
    );
  };
});

const mockUseAllEncounters = jest.mocked(useAllEncounters);

describe('CompletedFormsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when encounters are loading', () => {
    mockUseAllEncounters.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    } as any);

    renderWithSwr(<CompletedFormsTable patientUuid={mockPatientAlice.uuid} />);

    expect(screen.getByTestId('encounters-table')).toBeInTheDocument();
  });

  it('calls useAllEncounters hook with patientUuid', () => {
    mockUseAllEncounters.mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
    } as any);

    renderWithSwr(<CompletedFormsTable patientUuid={mockPatientAlice.uuid} />);

    expect(mockUseAllEncounters).toHaveBeenCalledWith(mockPatientAlice.uuid, undefined);
  });

  it('passes isSelectable true to EncountersTable', () => {
    mockUseAllEncounters.mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
    } as any);

    renderWithSwr(<CompletedFormsTable patientUuid={mockPatientAlice.uuid} />);

    const table = screen.getByTestId('encounters-table');
    expect(table).toHaveAttribute('data-is-selectable', 'true');
  });

  it('passes showEncounterTypeFilter true to EncountersTable', () => {
    mockUseAllEncounters.mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
    } as any);

    renderWithSwr(<CompletedFormsTable patientUuid={mockPatientAlice.uuid} />);

    const table = screen.getByTestId('encounters-table');
    expect(table).toHaveAttribute('data-show-encounter-type-filter', 'true');
  });

  it('passes showVisitType true to EncountersTable', () => {
    mockUseAllEncounters.mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
    } as any);

    renderWithSwr(<CompletedFormsTable patientUuid={mockPatientAlice.uuid} />);

    const table = screen.getByTestId('encounters-table');
    expect(table).toHaveAttribute('data-show-visit-type', 'true');
  });
});
