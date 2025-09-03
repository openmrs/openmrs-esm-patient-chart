import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LineChart } from '@carbon/charts-react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import ObsSwitchable from './obs-switchable.component';
import { useObs , type ObsResult } from '../resources/useObs';
import { configSchemaSwitchable } from '../config-schema-obs-switchable';

jest.mock('../resources/useObs', () => ({
  useObs: jest.fn(),
}));

const mockLineChart = jest.mocked(LineChart);

const mockUseConfig = jest.mocked(useConfig);

const mockObsData = [
  {
    code: { text: 'Height' },
    conceptUuid: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    dataType: 'Number',
    effectiveDateTime: '2021-01-01T00:00:00Z',
    valueQuantity: { value: 180 },
    encounter: { reference: 'Encounter/123' },
  },
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
    effectiveDateTime: '2021-01-01T00:00:00Z',
    valueQuantity: { value: 70 },
    encounter: { reference: 'Encounter/123' },
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

const mockUseObs = jest.mocked(useObs);

describe('ObsSwitchable', () => {
  it('should render all obs in table and numeric obs in graph', async () => {
    mockUseObs.mockReturnValue({
      data: mockObsData as Array<ObsResult>,
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
    expect(firstRow).toHaveTextContent('180');
    expect(firstRow).toHaveTextContent('70');
    expect(firstRow).toHaveTextContent('Too strong');
    expect(firstRow).toHaveTextContent('9001');
    const secondRow = screen.getAllByRole('row')[2];
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

    expect(mockLineChart).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: [
          { group: 'Tallitude', key: '01-Jan-2021', value: 180 },
          { group: 'Tallitude', key: '01-Feb-2021', value: 182 },
        ],
        options: expect.any(Object),
      }),
      {},
    );

    expect(mockLineChart).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: [
          { group: 'Weight', key: '01-Jan-2021', value: 70 },
          { group: 'Weight', key: '01-Feb-2021', value: 72 },
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
        data: [{ group: 'Power Level', key: '01-Jan-2021', value: 9001 }],
        options: expect.any(Object),
      }),
      {},
    );
  });

  it('should support showing graph tab by default', async () => {
    mockUseObs.mockReturnValue({
      data: mockObsData as Array<ObsResult>,
      error: null,
      isLoading: false,
      isValidating: false,
    });
    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchemaSwitchable) as Object),
      title: 'My Stats',
      data: [{ concept: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' }],
      showGraphByDefault: true,
    });

    render(<ObsSwitchable patientUuid="123" />);

    const tabs = screen.getByLabelText('Obs tabs');
    expect(tabs).toHaveTextContent('Height');

    expect(mockLineChart).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          { group: 'Height', key: '01-Jan-2021', value: 180 },
          { group: 'Height', key: '01-Feb-2021', value: 182 },
        ],
        options: expect.any(Object),
      }),
      {},
    );
  });

  it('should support grouping into multiline graphs', async () => {
    mockUseObs.mockReturnValue({
      data: mockObsData as Array<ObsResult>,
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
        data: [{ group: 'Power Level', key: '01-Jan-2021', value: 9001 }],
        options: expect.any(Object),
      }),
      {},
    );

    expect(mockLineChart).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: [
          { group: 'Height', key: '01-Jan-2021', value: 180 },
          { group: 'Height', key: '01-Feb-2021', value: 182 },
          { group: 'Weight', key: '01-Jan-2021', value: 70 },
          { group: 'Weight', key: '01-Feb-2021', value: 72 },
        ],
        options: expect.any(Object),
      }),
      {},
    );
  });
});
