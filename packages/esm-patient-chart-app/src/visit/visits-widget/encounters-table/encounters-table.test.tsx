import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { usePagination } from '@openmrs/esm-framework';
import { renderWithSwr } from 'tools';
import { mockEncounters2 } from '__mocks__';
import EncountersTable from './encounters-table.component';

jest.setTimeout(10000);

const testProps = {
  showAllEncounters: true,
  encounters: mockEncounters2,
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

    renderEncountersTable();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText(/no encounters found/i)).toBeInTheDocument();
  });

  it("renders a tabular overview of the patient's clinical encounters", async () => {
    testProps.encounters = mockEncounters2;

    mockedUsePagination.mockImplementationOnce(() => ({
      currentPage: 1,
      goTo: () => {},
      results: mockEncounters2,
    }));

    renderEncountersTable();

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('filters the encounter list when a user types into the searchbox', async () => {
    const user = userEvent.setup();

    mockedUsePagination.mockImplementationOnce(() => ({
      currentPage: 1,
      goTo: () => {},
      results: mockEncounters2,
    }));

    renderEncountersTable();

    const searchbox = screen.getByRole('searchbox');
    expect(searchbox).toBeInTheDocument();

    await user.type(searchbox, 'Consultation');
    expect(screen.getByText(/consultation/i)).toBeInTheDocument();

    await user.type(searchbox, 'Triage');

    expect(screen.getByText(/no encounters to display/i)).toBeInTheDocument();
    expect(screen.getByText(/check the filters above/i)).toBeInTheDocument();
  });
});

function renderEncountersTable() {
  renderWithSwr(<EncountersTable {...testProps} />);
}
