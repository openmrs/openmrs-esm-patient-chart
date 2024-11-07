import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useObstreeData } from './trendline-resource';
import Trendline from './trendline.component';

const mockUseObstreeData = jest.mocked(useObstreeData);

jest.mock('./trendline-resource', () => ({
  ...jest.requireActual('./trendline-resource'),
  useObstreeData: jest.fn(),
}));

describe('Trendline', () => {
  const patientUuid = 'test-patient-uuid';
  const conceptUuid = 'test-concept-uuid';

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

    render(<Trendline patientUuid={patientUuid} conceptUuid={conceptUuid} basePath="" />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
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

    render(<Trendline patientUuid={patientUuid} conceptUuid={conceptUuid} basePath="" />);

    expect(screen.getByTitle(/empty data illustration/i)).toBeInTheDocument();
    expect(screen.getByText(/there are no observations to display for this patient/i)).toBeInTheDocument();
  });

  it('renders chart and table toggle buttons when data is available', async () => {
    const user = userEvent.setup();

    mockUseObstreeData.mockReturnValue({
      trendlineData: {
        obs: [
          { obsDatetime: '2023-01-01', value: '5', interpretation: 'NORMAL' },
          { obsDatetime: '2023-01-02', value: '6', interpretation: 'HIGH' },
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

    render(<Trendline patientUuid={patientUuid} conceptUuid={conceptUuid} basePath="" />);

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
    expect(screen.getByText('Date and time')).toBeInTheDocument();
    expect(screen.getByText('Value (mg/dL)')).toBeInTheDocument();
    expect(screen.getByText('2023-01-01')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2023-01-02')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
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

    render(<Trendline patientUuid={patientUuid} conceptUuid={conceptUuid} basePath="" />);

    const toggleButton = screen.getByRole('button', { name: /show results table/i });

    await user.click(toggleButton);

    expect(screen.getByRole('button', { name: /hide results table/i })).toBeInTheDocument();
  });
});
