import React from 'react';
import { render, screen } from '@testing-library/react';
import { type GroupedObservation } from '../../types';
import IndividualResultsTable from './individual-results-table.component';

describe('IndividualResultsTable', () => {
  const mockSubRows = {
    key: 'HIV viral load',
    date: '2024-10-15',
    flatName: 'HIV viral load-HIV viral load',
    entries: [
      {
        obsDatetime: '2024-10-15 03:20:19.0',
        value: '45',
        interpretation: 'NORMAL',
        key: 'HIV viral load-HIV viral load',
        datatype: 'Numeric',
        lowAbsolute: 0,
        display: 'HIV viral load',
        conceptUuid: '856AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        units: 'copies/ml',
        flatName: 'HIV viral load-HIV viral load',
        hasData: true,
      },
    ],
  } as GroupedObservation;

  const mockEmptySubRows = {
    key: 'HIV viral load',
    date: '2024-10-15',
    flatName: 'HIV viral load-HIV viral load',
    entries: [],
  } as GroupedObservation;

  it('renders a loading skeleton when fetching results data', () => {
    render(<IndividualResultsTable isLoading={true} subRows={mockEmptySubRows} index={0} title={'HIV viral load'} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders a tabular overview of the available test result data', () => {
    render(<IndividualResultsTable isLoading={false} subRows={mockSubRows} index={0} title={'HIV viral load'} />);

    expect(screen.getByText(/15-Oct-2024/i)).toBeInTheDocument();
    expect(screen.getByText(/test name/i)).toBeInTheDocument();
    expect(screen.getByText(/reference range/i)).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /hiv viral load 45 copies\/ml -- copies\/ml/i })).toBeInTheDocument();
  });
});
