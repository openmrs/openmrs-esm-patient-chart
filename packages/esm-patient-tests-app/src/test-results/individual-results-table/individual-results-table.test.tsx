import React from 'react';
import { render, screen } from '@testing-library/react';
import { type OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import IndividualResultsTable from './individual-results-table.component';

describe('IndividualResultsTable', () => {
  const mockSubRows = [
    {
      obs: [
        {
          obsDatetime: '2021-01-13 02:10:06.0',
          value: '52.1',
          interpretation: 'NORMAL' as const as OBSERVATION_INTERPRETATION,
        },
      ],
      datatype: 'Numeric',
      lowAbsolute: 0,
      display: 'Prothrombin time',
      conceptUuid: '161481AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      units: 'Minute',
      flatName: 'Hematology-Prothrombin Time (with INR)-Prothrombin time',
      hasData: true,
      entries: [
        null,
        null,
        null,
        {
          obsDatetime: '2021-01-13 02:10:06.0',
          value: '52.1',
          interpretation: 'NORMAL' as const as OBSERVATION_INTERPRETATION,
        },
      ],
    },
  ];

  it('renders a loading skeleton when fetching results data', () => {
    render(<IndividualResultsTable isLoading={true} parent={{ display: 'Parent Test' }} subRows={[]} index={0} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders a tabular overview of the available test result data', () => {
    render(
      <IndividualResultsTable isLoading={false} parent={{ display: 'Parent Test' }} subRows={mockSubRows} index={0} />,
    );

    expect(screen.getByText(/13-jan-2021/i)).toBeInTheDocument();
    expect(screen.getByText(/test name/i)).toBeInTheDocument();
    expect(screen.getByText(/reference range/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view timeline/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /prothrombin time 52.1 minute -- minute/i })).toBeInTheDocument();
  });
});
