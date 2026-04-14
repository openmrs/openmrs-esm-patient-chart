import React from 'react';
import { screen } from '@testing-library/react';
import { type Visit } from '@openmrs/esm-framework';
import VisitCompletedFormsTable from './visit-completed-forms-table.component';
import { renderWithSwr } from 'tools';
import { mockPatientAlice } from '__mocks__';

jest.mock('./encounters-table.component', () => {
  return function MockedEncountersTable(props: any) {
    return (
      <div
        data-testid="encounters-table"
        data-is-selectable={props.isSelectable}
        data-show-encounter-type-filter={props.showEncounterTypeFilter}
        data-show-visit-type={props.showVisitType}
        data-is-loading={props.isLoading}
        data-total-count={props.totalCount}
      >
        EncountersTable
      </div>
    );
  };
});

describe('VisitCompletedFormsTable', () => {
  const mockVisit: Visit = {
    uuid: 'visit-123',
    display: 'Facility Visit',
    patient: mockPatientAlice,
    visitType: {
      uuid: 'visit-type-1',
      display: 'Facility Visit',
    },
    encounters: [],
    startDatetime: '2022-01-18T12:25:27.000+0000',
    stopDatetime: '2022-01-18T17:25:27.000+0000',
  } as Visit;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the encounters table with empty array when visit has no encounters', () => {
    renderWithSwr(<VisitCompletedFormsTable patientUuid={mockPatientAlice.uuid} visit={mockVisit} />);

    expect(screen.getByTestId('encounters-table')).toBeInTheDocument();
  });

  it('passes isSelectable false to EncountersTable', () => {
    renderWithSwr(<VisitCompletedFormsTable patientUuid={mockPatientAlice.uuid} visit={mockVisit} />);

    const table = screen.getByTestId('encounters-table');
    expect(table).toHaveAttribute('data-is-selectable', 'false');
  });

  it('passes showEncounterTypeFilter false to EncountersTable', () => {
    renderWithSwr(<VisitCompletedFormsTable patientUuid={mockPatientAlice.uuid} visit={mockVisit} />);

    const table = screen.getByTestId('encounters-table');
    expect(table).toHaveAttribute('data-show-encounter-type-filter', 'false');
  });

  it('passes showVisitType false to EncountersTable', () => {
    renderWithSwr(<VisitCompletedFormsTable patientUuid={mockPatientAlice.uuid} visit={mockVisit} />);

    const table = screen.getByTestId('encounters-table');
    expect(table).toHaveAttribute('data-show-visit-type', 'false');
  });

  it('passes isLoading false to EncountersTable', () => {
    renderWithSwr(<VisitCompletedFormsTable patientUuid={mockPatientAlice.uuid} visit={mockVisit} />);

    const table = screen.getByTestId('encounters-table');
    expect(table).toHaveAttribute('data-is-loading', 'false');
  });

  it('handles null visit gracefully', () => {
    renderWithSwr(<VisitCompletedFormsTable patientUuid={mockPatientAlice.uuid} visit={null as any} />);

    const table = screen.getByTestId('encounters-table');
    expect(table).toHaveAttribute('data-total-count', '0');
  });
});
