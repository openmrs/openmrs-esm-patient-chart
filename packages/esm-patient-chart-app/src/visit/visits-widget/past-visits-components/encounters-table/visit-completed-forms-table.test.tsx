import React from 'react';
import { screen } from '@testing-library/react';
import { type Visit } from '@openmrs/esm-framework';
import { mockPatientAlice } from '__mocks__';
import { renderWithSwr } from 'tools';
import VisitCompletedFormsTable from './visit-completed-forms-table.component';

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

  it('renders the encounters table with empty array when visit has no encounters', () => {
    renderWithSwr(<VisitCompletedFormsTable patientUuid={mockPatientAlice.uuid} visit={mockVisit} />);

    expect(screen.getByTestId('encounters-table')).toBeInTheDocument();
  });

  it('renders the encounters table with row selection disabled', () => {
    renderWithSwr(<VisitCompletedFormsTable patientUuid={mockPatientAlice.uuid} visit={mockVisit} />);

    const table = screen.getByTestId('encounters-table');
    expect(table).toHaveAttribute('data-is-selectable', 'false');
  });

  it('renders the encounters table without the encounter type filter', () => {
    renderWithSwr(<VisitCompletedFormsTable patientUuid={mockPatientAlice.uuid} visit={mockVisit} />);

    const table = screen.getByTestId('encounters-table');
    expect(table).toHaveAttribute('data-show-encounter-type-filter', 'false');
  });

  it('renders the encounters table without the visit type column', () => {
    renderWithSwr(<VisitCompletedFormsTable patientUuid={mockPatientAlice.uuid} visit={mockVisit} />);

    const table = screen.getByTestId('encounters-table');
    expect(table).toHaveAttribute('data-show-visit-type', 'false');
  });

  it('renders the encounters table without a loading state', () => {
    renderWithSwr(<VisitCompletedFormsTable patientUuid={mockPatientAlice.uuid} visit={mockVisit} />);

    const table = screen.getByTestId('encounters-table');
    expect(table).toHaveAttribute('data-is-loading', 'false');
  });

  it('handles null visit gracefully', () => {
    renderWithSwr(<VisitCompletedFormsTable patientUuid={mockPatientAlice.uuid} visit={null as any} />);

    const table = screen.getByTestId('encounters-table');
    expect(table).toHaveAttribute('data-total-count', '0');
  });

  it('only includes encounters that have a form with a JSON schema resource', () => {
    const visitWithMixedEncounters = {
      ...mockVisit,
      encounters: [
        {
          uuid: 'enc-with-schema',
          form: {
            uuid: 'form-1',
            display: 'Form With Schema',
            resources: [{ uuid: 'r1', name: 'JSON schema', valueReference: '{}' }],
          },
          encounterDatetime: '2022-01-18T16:25:27.000+0000',
          encounterType: { uuid: 'type-1', display: 'Admission' },
          obs: [],
          encounterProviders: [],
        },
        {
          uuid: 'enc-without-schema',
          form: {
            uuid: 'form-2',
            display: 'Form Without Schema',
            resources: [],
          },
          encounterDatetime: '2022-01-18T14:00:00.000+0000',
          encounterType: { uuid: 'type-1', display: 'Admission' },
          obs: [],
          encounterProviders: [],
        },
        {
          uuid: 'enc-no-form',
          form: null,
          encounterDatetime: '2022-01-18T12:00:00.000+0000',
          encounterType: { uuid: 'type-2', display: 'Visit Note' },
          obs: [],
          encounterProviders: [],
        },
      ],
    } as Visit;

    renderWithSwr(<VisitCompletedFormsTable patientUuid={mockPatientAlice.uuid} visit={visitWithMixedEncounters} />);

    const table = screen.getByTestId('encounters-table');
    expect(table).toHaveAttribute('data-total-count', '1');
  });
});
