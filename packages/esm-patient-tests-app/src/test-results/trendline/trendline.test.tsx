import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useObstreeData } from './trendline-resource';
import Trendline from './trendline.component';

const mockLineChart = jest.fn((_props: unknown) => null);

jest.mock('@carbon/charts-react', () => {
  const actual = jest.requireActual('@carbon/charts-react');
  return {
    ...actual,
    LineChart: (props: unknown) => {
      mockLineChart(props);
      return null;
    },
  };
});

const mockUseObstreeData = jest.mocked(useObstreeData);

jest.mock('./trendline-resource', () => ({
  ...jest.requireActual('./trendline-resource'),
  useObstreeData: jest.fn(),
}));

describe('Trendline', () => {
  const patientUuid = 'test-patient-uuid';
  const conceptUuid = 'test-concept-uuid';

  beforeEach(() => {
    mockLineChart.mockClear();
  });

  it('renders a loading state when fetching trendline data', () => {
    mockUseObstreeData.mockReturnValue({
      trendlineData: {
        obs: [],
        display: '',
        hiNormal: 0,
        lowNormal: 0,
        units: '',
        flatName: '',
      },
      isLoading: true,
      isValidating: false,
    });

    render(<Trendline patientUuid={patientUuid} conceptUuid={conceptUuid} />);

    expect(screen.getByTestId('trendline-loading')).toBeInTheDocument();
    expect(screen.getByTestId('trendline-loading-header')).toBeInTheDocument();
    expect(screen.getByTestId('trendline-loading-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('trendline-loading-chart')).toBeInTheDocument();
  });

  it('renders an empty state when there are no observations', () => {
    mockUseObstreeData.mockReturnValue({
      trendlineData: {
        obs: [],
        display: '',
        hiNormal: 0,
        lowNormal: 0,
        units: '',
        flatName: '',
      },
      isLoading: false,
      isValidating: false,
    });

    render(<Trendline patientUuid={patientUuid} conceptUuid={conceptUuid} />);

    expect(screen.getByTitle(/empty data illustration/i)).toBeInTheDocument();
    expect(screen.getByText(/there are no observations to display for this patient/i)).toBeInTheDocument();
  });

  it('renders chart and table toggle buttons when data is available', async () => {
    const user = userEvent.setup();

    mockUseObstreeData.mockReturnValue({
      trendlineData: {
        obs: [
          { obsDatetime: '05-Sept-2021, 04:07 AM', value: '5', interpretation: 'NORMAL' },
          { obsDatetime: '11-May-2023, 11:02 AM', value: '6', interpretation: 'HIGH' },
        ],
        display: 'Test Chart Title',
        hiNormal: 10,
        lowNormal: 1,
        units: 'mg/dL',
        flatName: '',
      },
      isLoading: false,
      isValidating: false,
    });

    render(<Trendline patientUuid={patientUuid} conceptUuid={conceptUuid} />);

    const showResultsTableButton = screen.getByRole('button', { name: /show results table/i });

    expect(screen.getByRole('tablist', { name: /trendline range tabs/i })).toBeInTheDocument();

    const expectedTabs = [/1 day/, /5 days/, /1 month/, /6 months/, /1 year/, /5 years/, /all/];

    expectedTabs.forEach((tab) => {
      expect(screen.getByRole('tab', { name: new RegExp(tab, 'i') })).toBeInTheDocument();
    });

    expect(showResultsTableButton).toBeInTheDocument();
    expect(screen.getByText(/Test Chart Title/)).toBeInTheDocument();

    await user.click(showResultsTableButton);

    expect(screen.getByRole('button', { name: /hide results table/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /date and time/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /value/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /reference range/i })).toBeInTheDocument();
    expect(screen.getByText('05-Sept-2021, 04:07 AM')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('11-May-2023, 11:02 AM')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    // Both rows show the same concept-level range (no observation-level ranges in test data)
    expect(screen.getAllByText('1 – 10 mg/dL')).toHaveLength(2);
  });

  it('toggles the results table visibility when the show results table button is clicked', async () => {
    const user = userEvent.setup();
    mockUseObstreeData.mockReturnValue({
      trendlineData: {
        obs: [{ obsDatetime: '2023-01-01', value: '5', interpretation: 'NORMAL' }],
        flatName: '',
        display: 'Test Chart Title',
        hiNormal: 10,
        lowNormal: 1,
        units: 'mg/dL',
      },
      isLoading: false,
      isValidating: false,
    });

    render(<Trendline patientUuid={patientUuid} conceptUuid={conceptUuid} />);

    const toggleButton = screen.getByRole('button', { name: /show results table/i });

    await user.click(toggleButton);

    expect(screen.getByRole('button', { name: /hide results table/i })).toBeInTheDocument();
  });

  it('shows reference range in the tooltip content', () => {
    mockUseObstreeData.mockReturnValue({
      trendlineData: {
        obs: [
          {
            obsDatetime: '2023-01-01T00:00:00.000Z',
            value: '5',
            interpretation: 'NORMAL',
            lowNormal: 10,
            hiNormal: 12,
          },
        ],
        display: 'Test Chart Title',
        hiNormal: 20,
        lowNormal: 1,
        units: 'mg/dL',
        flatName: '',
      },
      isLoading: false,
      isValidating: false,
    });

    render(<Trendline patientUuid={patientUuid} conceptUuid={conceptUuid} />);

    expect(mockLineChart).toHaveBeenCalled();
    const calls = mockLineChart.mock.calls as unknown as Array<
      [
        {
          data: Array<{ date: Date; value: number; group: string; min?: number; max?: number; rangeLabel?: string }>;
          options: { tooltip: { customHTML: (data: Array<unknown>) => string } };
        },
      ]
    >;
    const chartProps = calls[0][0];
    const tooltipHtml = chartProps.options.tooltip.customHTML([chartProps.data[0]]);

    expect(tooltipHtml).toContain('Range');
    expect(tooltipHtml).toContain('10 – 12 mg/dL');
  });

  it('falls back to concept-level range for the tooltip when observation range is missing', () => {
    mockUseObstreeData.mockReturnValue({
      trendlineData: {
        obs: [
          {
            obsDatetime: '2023-01-01T00:00:00.000Z',
            value: '5',
            interpretation: 'NORMAL',
          },
        ],
        display: 'Test Chart Title',
        hiNormal: 10,
        lowNormal: 1,
        units: 'mg/dL',
        flatName: '',
      },
      isLoading: false,
      isValidating: false,
    });

    render(<Trendline patientUuid={patientUuid} conceptUuid={conceptUuid} />);

    const calls = mockLineChart.mock.calls as unknown as Array<
      [
        {
          data: Array<{ date: Date; value: number; group: string; min?: number; max?: number; rangeLabel?: string }>;
          options: { tooltip: { customHTML: (data: Array<unknown>) => string } };
        },
      ]
    >;
    const chartProps = calls[0][0];
    const tooltipHtml = chartProps.options.tooltip.customHTML([chartProps.data[0]]);

    expect(tooltipHtml).toContain('1 – 10 mg/dL');
  });
});
