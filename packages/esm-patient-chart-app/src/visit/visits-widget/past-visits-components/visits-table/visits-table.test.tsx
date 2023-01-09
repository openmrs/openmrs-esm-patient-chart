import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { usePagination } from '@openmrs/esm-framework';
import { renderWithSwr } from '../../../../../../../tools/test-helpers';
import { mockEncounters } from '../../../../../../../__mocks__/visits.mock';
import VisitsTable from './visits-table.component';

jest.setTimeout(10000);

const testProps = {
  showAllEncounters: true,
  visits: mockEncounters,
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
    testProps.visits = [];

    mockedUsePagination.mockImplementationOnce(() => ({
      currentPage: 1,
      goTo: () => {},
      results: [],
    }));

    renderVisitsTable();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText(/no encounters found/i)).toBeInTheDocument();
  });

  it("renders a tabular overview of the patient's clinical encounters", async () => {
    const user = userEvent.setup();

    testProps.visits = mockEncounters;

    mockedUsePagination.mockImplementationOnce(() => ({
      currentPage: 1,
      goTo: () => {},
      results: mockEncounters,
    }));

    renderVisitsTable();

    expect(screen.getByRole('table')).toBeInTheDocument();
    const searchbox = screen.getByRole('searchbox', { name: /filter table/i });
    expect(searchbox).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: /filter by encounter type/i }));

    const expectedColumnHeaders = [/date & time/, /visit type/, /encounter type/, /provider/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const expectedTableRows = [
      /18-Jan-2022, 04:25\s+PM Facility Visit Admission/,
      /03-Aug-2021, 12:47\s+AM Facility Visit Visit Note User One/,
      /05-Jul-2021, 10:07\s+AM Facility Visit Consultation Dennis The Doctor/,
    ];
    expectedTableRows.forEach((row) => {
      expect(screen.getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /expand current row/i }).length).toEqual(3);

    // filter table to show only `Admission` encounters
    const encounterTypeFilter = screen.getByRole('button', { name: /filter by encounter type/i });

    await waitFor(() => user.click(encounterTypeFilter));
    await waitFor(() => user.click(screen.getByRole('option', { name: /Admission/i })));

    expect(screen.queryByRole('cell', { name: /visit note/i })).not.toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /admission/i })).toBeInTheDocument();

    // show all encounter types
    await waitFor(() => user.click(encounterTypeFilter));
    await waitFor(() => user.click(screen.getByRole('option', { name: /all/i })));

    // filter table by typing in the searchbox
    await waitFor(() => user.type(searchbox, 'Visit Note'));

    expect(screen.getByText(/visit note/i)).toBeInTheDocument();
    expect(screen.queryByText(/consultation/i)).not.toBeInTheDocument();

    await waitFor(() => user.clear(searchbox));
    await waitFor(() => user.type(searchbox, 'triage'));

    expect(screen.getByText(/no encounters to display/i)).toBeInTheDocument();
    expect(screen.getByText(/check the filters above/i)).toBeInTheDocument();
  });
});

function renderVisitsTable() {
  renderWithSwr(<VisitsTable {...testProps} />);
}
