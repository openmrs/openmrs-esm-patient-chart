import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LineChart } from '@carbon/charts-react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import ObsSwitchable from './obs-switchable.component';
import { useObs, type ObsResult } from '../resources/useObs';
import { configSchemaSwitchable } from '../config-schema-obs-switchable';

jest.mock('../resources/useObs', () => ({
  useObs: jest.fn(),
}));

const mockLineChart = jest.mocked(LineChart);

const mockUseConfig = jest.mocked(useConfig);

// Make sure this respects the sort order of useObs
const mockObsData = [
  {
    code: { text: 'Height' },
    conceptUuid: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    dataType: 'Number',
    effectiveDateTime: '2021-02-01T00:00:00Z',
    valueQuantity: { value: 182 },
    encounter: { reference: 'Encounter/234' },
  },
  {
    code: { text: 'Weight' },
    conceptUuid: '2154AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    dataType: 'Number',
    effectiveDateTime: '2021-02-01T00:00:00Z',
    valueQuantity: { value: 72 },
    encounter: { reference: 'Encounter/234' },
  },
  {
    code: { text: 'Height' },
    conceptUuid: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    dataType: 'Number',
    effectiveDateTime: '2021-01-01T00:00:00Z',
    valueQuantity: { value: 180 },
    encounter: { reference: 'Encounter/123' },
  },
  {
    code: { text: 'Weight' },
    conceptUuid: '2154AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    dataType: 'Number',
    effectiveDateTime: '2021-01-01T00:00:00Z',
    valueQuantity: { value: 70 },
    encounter: { reference: 'Encounter/123' },
  },
  {
    code: { text: 'Chief Complaint' },
    conceptUuid: '164162AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    dataType: 'Text',
    effectiveDateTime: '2021-01-01T00:00:00Z',
    valueString: 'Too strong',
    encounter: { reference: 'Encounter/123' },
  },
  {
    code: { text: 'Power Level' },
    conceptUuid: '164163AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    dataType: 'Number',
    effectiveDateTime: '2021-01-01T00:00:00Z',
    valueQuantity: { value: 9001 },
    encounter: { reference: 'Encounter/123' },
  },
];

const mockConceptData = [
  { uuid: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Height' },
  { uuid: '2154AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Weight' },
  { uuid: '164162AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Chief Complaint' },
  { uuid: '164163AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Power Level' },
];

const mockUseObs = jest.mocked(useObs);

describe('ObsSwitchable', () => {
  it('should render all obs in table and numeric obs in graph', async () => {
    mockUseObs.mockReturnValue({
      data: { observations: mockObsData as Array<ObsResult>, concepts: mockConceptData },
      error: null,
      isLoading: false,
      isValidating: false,
    });
    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchemaSwitchable) as Object),
      title: 'My Stats',
      data: [
        {
          concept: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          label: 'Tallitude',
        },
        {
          concept: '2154AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        },
        { concept: '164162AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
        { concept: '164163AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
      ],
    });

    render(<ObsSwitchable patientUuid="123" />);

    // Check table
    expect(screen.getAllByRole('row')).toHaveLength(3);
    const headerRow = screen.getAllByRole('row')[0];
    expect(headerRow).toHaveTextContent('Tallitude');
    expect(headerRow).toHaveTextContent('Weight');
    expect(headerRow).toHaveTextContent('Chief Complaint');
    expect(headerRow).toHaveTextContent('Power Level');
    const firstRow = screen.getAllByRole('row')[1];
    expect(firstRow).toHaveTextContent('Jan');
    expect(firstRow).toHaveTextContent('180');
    expect(firstRow).toHaveTextContent('70');
    expect(firstRow).toHaveTextContent('Too strong');
    expect(firstRow).toHaveTextContent('9001');
    const secondRow = screen.getAllByRole('row')[2];
    expect(secondRow).toHaveTextContent('Feb');
    expect(secondRow).toHaveTextContent('182');
    expect(secondRow).toHaveTextContent('72');
    expect(secondRow).toHaveTextContent('--');
    expect(secondRow).toHaveTextContent('--');

    const user = userEvent.setup();
    const chartViewButton = screen.getByLabelText('Chart view');
    expect(chartViewButton).toBeInTheDocument();
    await user.click(chartViewButton);

    const tabs = screen.getByLabelText('Obs tabs');
    expect(tabs).toHaveTextContent('Tallitude');
    expect(tabs).toHaveTextContent('Weight');
    expect(tabs).not.toHaveTextContent('Chief Complaint');
    expect(tabs).toHaveTextContent('Power Level');
    expect(tabs).not.toHaveTextContent('Mystery Concept');

    expect(mockLineChart).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: [
          { group: 'Tallitude', key: new Date('2021-02-01T00:00:00.000Z'), value: 182 },
          { group: 'Tallitude', key: new Date('2021-01-01T00:00:00.000Z'), value: 180 },
        ],
        options: expect.any(Object),
      }),
      {},
    );

    expect(mockLineChart).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: [
          { group: 'Weight', key: new Date('2021-02-01T00:00:00.000Z'), value: 72 },
          { group: 'Weight', key: new Date('2021-01-01T00:00:00.000Z'), value: 70 },
        ],
        options: expect.any(Object),
      }),
      {},
    );

    expect(mockLineChart).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: [expect.objectContaining({ group: 'Chief Complaint' })],
        options: expect.any(Object),
      }),
      {},
    );

    expect(mockLineChart).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        data: [{ group: 'Power Level', key: new Date('2021-01-01T00:00:00.000Z'), value: 9001 }],
        options: expect.any(Object),
      }),
      {},
    );
  });

  it('should support showing graph tab by default', async () => {
    mockUseObs.mockReturnValue({
      data: { observations: mockObsData as Array<ObsResult>, concepts: mockConceptData },
      error: null,
      isLoading: false,
      isValidating: false,
    });
    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchemaSwitchable) as Object),
      title: 'My Stats',
      data: [{ concept: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' }, { concept: '2154AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' }],
      showGraphByDefault: true,
    });

    render(<ObsSwitchable patientUuid="123" />);

    const tabs = screen.getByLabelText('Obs tabs');
    expect(tabs).toHaveTextContent('Height');
    expect(tabs).toHaveTextContent('Weight');

    expect(mockLineChart).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: [
          { group: 'Height', key: new Date('2021-02-01T00:00:00.000Z'), value: 182 },
          { group: 'Height', key: new Date('2021-01-01T00:00:00.000Z'), value: 180 },
        ],
        options: expect.any(Object),
      }),
      {},
    );
  });

  it('should support grouping into multiline graphs', async () => {
    mockUseObs.mockReturnValue({
      data: { observations: mockObsData as Array<ObsResult>, concepts: mockConceptData },
      error: null,
      isLoading: false,
      isValidating: false,
    });
    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchemaSwitchable) as Object),
      title: 'My Stats',
      showGraphByDefault: true,
      data: [
        { concept: '164163AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', graphGroup: 'Power Level' },
        { concept: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', graphGroup: 'Biometrics' },
        { concept: '2154AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', graphGroup: 'Biometrics' },
      ],
    });

    render(<ObsSwitchable patientUuid="123" />);

    const tabs = screen.getByLabelText('Obs tabs');
    expect(tabs).toHaveTextContent('Power Level');
    expect(tabs).toHaveTextContent('Biometrics');

    expect(mockLineChart).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: [{ group: 'Power Level', key: new Date('2021-01-01T00:00:00.000Z'), value: 9001 }],
        options: expect.any(Object),
      }),
      {},
    );

    expect(mockLineChart).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: [
          { group: 'Height', key: new Date('2021-02-01T00:00:00.000Z'), value: 182 },
          { group: 'Height', key: new Date('2021-01-01T00:00:00.000Z'), value: 180 },
          { group: 'Weight', key: new Date('2021-02-01T00:00:00.000Z'), value: 72 },
          { group: 'Weight', key: new Date('2021-01-01T00:00:00.000Z'), value: 70 },
        ],
        options: expect.any(Object),
      }),
      {},
    );
  });

  it('should hide the graph tab selection if there is only one graph', async () => {
    mockUseObs.mockReturnValue({
      data: {
        observations: mockObsData.filter(
          (o) => o.conceptUuid === '164163AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        ) as Array<ObsResult>,
        concepts: mockConceptData,
      },
      error: null,
      isLoading: false,
      isValidating: false,
    });
    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchemaSwitchable) as Object),
      title: 'My Stats',
      showGraphByDefault: true,
      data: [{ concept: '164163AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' }],
    });

    render(<ObsSwitchable patientUuid="123" />);

    expect(screen.queryByLabelText('Obs tabs')).not.toBeInTheDocument();

    expect(mockLineChart).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ group: 'Power Level', key: new Date('2021-01-01T00:00:00.000Z'), value: 9001 }],
        options: expect.any(Object),
      }),
      {},
    );
  });
});
