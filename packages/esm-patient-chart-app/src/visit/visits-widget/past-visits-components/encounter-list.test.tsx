import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { usePagination } from '@openmrs/esm-framework';
import { renderWithSwr } from '../../../../../../tools/test-helpers';
import { mockEncounters } from '../../../../../../__mocks__/visits.mock';
import EncounterList from './encounter-list.component';

const testProps = {
  showAllEncounters: true,
  encounters: mockEncounters,
};

const mockedUsePagination = usePagination as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    usePagination: jest.fn().mockImplementation((data) => ({
      currentPage: 1,
      goTo: () => {},
      results: data,
    })),
  };
});

describe('EncounterList', () => {
  it('renders an empty state when no encounters are available', () => {
    testProps.encounters = [];

    mockedUsePagination.mockImplementationOnce(() => ({
      currentPage: 1,
      goTo: () => {},
      results: [],
    }));

    renderEncounterList();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText(/no encounters found/i)).toBeInTheDocument();
  });

  it("renders a tabular overview of the patient's clinical encounters", () => {
    testProps.encounters = mockEncounters;

    mockedUsePagination.mockImplementationOnce(() => ({
      currentPage: 1,
      goTo: () => {},
      results: mockEncounters,
    }));

    renderEncounterList();

    expect(screen.getByRole('table')).toBeInTheDocument();
    const searchbox = screen.getByRole('searchbox', { name: /filter table/i });
    expect(searchbox).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: /filter by encounter type/i }));

    const expectedColumnHeaders = [/date & time/, /visit type/, /encounter type/, /provider/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const expectedTableRows = [
      /18-Jan-2022, 04:25 PM Facility Visit Admission/,
      /03-Aug-2021, 12:47 AM Facility Visit Visit Note User One/,
      /05-Jul-2021, 10:07 AM Facility Visit Visit Note Dennis The Doctor/,
    ];
    expectedTableRows.forEach((row) => {
      expect(screen.getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /expand current row/i }).length).toEqual(3);

    // filter table to show only `Admission` encounters
    const encounterTypeFilter = screen.getByRole('button', { name: /filter by encounter type/i });
    userEvent.click(encounterTypeFilter);
    userEvent.click(screen.getByRole('option', { name: /Admission/i }));

    expect(screen.queryByRole('cell', { name: /visit note/i })).not.toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /admission/i })).toBeInTheDocument();

    // show all encounter types
    userEvent.click(encounterTypeFilter);
    userEvent.click(screen.getByRole('option', { name: /all/i }));

    expect(screen.getByText(/admission/i)).toBeInTheDocument();
    expect(screen.getAllByText(/visit note/i).length).toEqual(2);

    // filter table by typing in the searchbox
    userEvent.type(searchbox, 'Dennis');

    expect(screen.getByText(/dennis/i)).toBeInTheDocument();
    expect(screen.queryByText(/user one/i)).not.toBeInTheDocument();

    userEvent.clear(searchbox);
    userEvent.type(searchbox, 'luke skywalker');

    expect(screen.getByText(/no patients to display/i)).toBeInTheDocument();
    expect(screen.getByText(/check the filters above/i)).toBeInTheDocument();
  });
});

function renderEncounterList() {
  renderWithSwr(<EncounterList {...testProps} />);
}
