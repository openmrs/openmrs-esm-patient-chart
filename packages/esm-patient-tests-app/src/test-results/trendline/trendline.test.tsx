import React from 'react';
import { render, screen } from '@testing-library/react';
import Trendline from './trendline.component';
import userEvent from '@testing-library/user-event';

const mockUseObstreeData = jest.fn();

jest.mock('./trendline-resource', () => ({
  ...jest.requireActual('./trendline-resource'),
  useObstreeData: () => mockUseObstreeData(),
}));

describe('Trendline Component', () => {
  const patientUuid = 'test-patient-uuid';
  const conceptUuid = 'test-concept-uuid';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state when data is being fetched', () => {
    mockUseObstreeData.mockReturnValue({
      trendlineData: {
        obs: [],
        display: '',
        hiNormal: 0,
        lowNormal: 0,
        units: '',
      },
      isLoading: true,
      isValidating: false,
    });
    render(<Trendline patientUuid={patientUuid} conceptUuid={conceptUuid} basePath="" />);
    expect(screen.getByRole('paragraph')).toHaveClass('cds--skeleton__text');
  });

  it('should render empty state when no observations are available', () => {
    mockUseObstreeData.mockReturnValue({
      trendlineData: {
        obs: [],
        display: '',
        hiNormal: 0,
        lowNormal: 0,
        units: '',
      },
      isLoading: false,
      isValidating: false,
    });
    render(<Trendline patientUuid={patientUuid} conceptUuid={conceptUuid} basePath="" />);

    expect(screen.getByText(/observations/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no observations to display for this patient/i)).toBeInTheDocument();
  });

  it('should render chart and table toggle button when data is available', async () => {
    mockUseObstreeData.mockReturnValue({
      trendlineData: {
        obs: [
          { obsDatetime: '2023-01-01', value: '5', interpretation: 'normal' },
          { obsDatetime: '2023-01-02', value: '6', interpretation: 'high' },
        ],
        display: 'Test Chart Title',
        hiNormal: 10,
        lowNormal: 1,
        units: 'mg/dL',
      },
      isLoading: false,
      isValidating: false,
    });

    render(<Trendline patientUuid={patientUuid} conceptUuid={conceptUuid} basePath="" />);

    expect(screen.getByText(/Test Chart Title/)).toBeInTheDocument();
    expect(screen.getByText(/1 day/i)).toBeInTheDocument();
    expect(screen.getByText(/5 days/i)).toBeInTheDocument();
    expect(screen.getByText(/show results table/i)).toBeInTheDocument();

    await userEvent.click(screen.getByText(/show results table/i));
    expect(screen.getByText('Date and time')).toBeInTheDocument();
    expect(screen.getByText('Value (mg/dL)')).toBeInTheDocument();
    expect(screen.getByText('2023-01-01')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2023-01-02')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('should toggle the results table visibility when button is clicked', async () => {
    mockUseObstreeData.mockReturnValue({
      trendlineData: {
        obs: [{ obsDatetime: '2023-01-01', value: '5', interpretation: 'normal' }],
        display: 'Test Chart Title',
        hiNormal: 10,
        lowNormal: 1,
        units: 'mg/dL',
      },
      isLoading: false,
      isValidating: false,
    });

    render(<Trendline patientUuid={patientUuid} conceptUuid={conceptUuid} basePath="" />);

    const toggleButton = screen.getByText(/show results table/i);
    await userEvent.click(toggleButton);
    expect(screen.getByText(/hide results table/i)).toBeInTheDocument();
  });
});
