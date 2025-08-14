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
        range: '0 – 50', // Node-level range
        lowNormal: 0,
        hiNormal: 50,
      },
    ],
  } as GroupedObservation;

  const mockSubRowsWithObservationRange = {
    key: 'Alkaline phosphatase',
    date: '2024-10-15',
    flatName: 'Alkaline phosphatase',
    entries: [
      {
        obsDatetime: '2024-10-15 03:20:19.0',
        value: '15',
        interpretation: 'CRITICALLY_LOW',
        key: 'Alkaline phosphatase',
        datatype: 'Numeric',
        lowAbsolute: 0,
        display: 'Alkaline phosphatase',
        conceptUuid: '785AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        units: 'U/L',
        flatName: 'Alkaline phosphatase',
        hasData: true,
        range: '35 – 147', // Observation-level range (different from node-level)
        lowNormal: 35,
        hiNormal: 147,
        lowCritical: 25,
        hiCritical: 200,
      },
    ],
    range: '0 – 270', // Node-level range (fallback)
    units: 'U/L',
  } as GroupedObservation;

  const mockEmptySubRows = {
    key: 'HIV viral load',
    date: '2024-10-15',
    flatName: 'HIV viral load-HIV viral load',
    entries: [],
  } as GroupedObservation;

  it('renders a loading skeleton when fetching results data', () => {
    render(
      <IndividualResultsTable
        patientUuid={'patient-uuid'}
        isLoading={true}
        subRows={mockEmptySubRows}
        index={0}
        title={'HIV viral load'}
      />,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders a tabular overview of the available test result data', () => {
    render(
      <IndividualResultsTable
        patientUuid={'patient-uuid'}
        isLoading={false}
        subRows={mockSubRows}
        index={0}
        title={'HIV viral load'}
      />,
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText(/15-Oct-2024/i)).toBeInTheDocument();
    expect(screen.getByText(/test name/i)).toBeInTheDocument();
    expect(screen.getByText(/reference range/i)).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /hiv viral load 45 copies\/ml 0 – 50 copies\/ml/i })).toBeInTheDocument();
  });

  it('uses observation-level range when available', () => {
    render(
      <IndividualResultsTable
        isLoading={false}
        subRows={mockSubRowsWithObservationRange}
        index={0}
        title={'Alkaline phosphatase'}
      />,
    );

    // Should display observation-level range (35 – 147) not node-level (0 – 270)
    expect(screen.getByRole('row', { name: /alkaline phosphatase 15 u\/l 35 – 147 u\/l/i })).toBeInTheDocument();
  });
});
