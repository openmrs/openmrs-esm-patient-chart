import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { usePagination } from '@openmrs/esm-framework';
import { renderWithSwr } from '../../../../../../tools/test-helpers';
import { mockEncounters2 } from '../../../../../../__mocks__/visits.mock';
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
    const user = userEvent.setup();

    testProps.encounters = mockEncounters2;

    mockedUsePagination.mockImplementationOnce(() => ({
      currentPage: 1,
      goTo: () => {},
      results: mockEncounters2,
    }));

    renderEncountersTable();

    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});

function renderEncountersTable() {
  renderWithSwr(<EncountersTable {...testProps} />);
}
