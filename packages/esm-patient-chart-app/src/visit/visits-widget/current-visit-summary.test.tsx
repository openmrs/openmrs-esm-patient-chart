import React from 'react';
import { render, screen } from '@testing-library/react';
import { waitForLoadingToFinish } from 'tools';
import { useVisit, getConfig, useFeatureFlag } from '@openmrs/esm-framework';
import CurrentVisitSummary from './current-visit-summary.component';

const mockUseVisits = useVisit as jest.Mock;
const mockGetConfig = getConfig as jest.Mock;
const mockedUseFeatureFlag = useFeatureFlag as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework/mock'),
  useVisits: jest.fn(),
  getConfig: jest.fn(),
}));

describe('CurrentVisitSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders an empty state when there is no active visit', () => {
    mockUseVisits.mockReturnValueOnce({
      currentVisit: null,
      isLoading: true,
      isValidating: false,
      error: null,
    });

    render(<CurrentVisitSummary patientUuid="some-uuid" />);
    expect(screen.getByText('Loading current visit...')).toBeInTheDocument();
  });

  test('should display empty state when there is no active visit', () => {
    mockUseVisits.mockReturnValueOnce({
      currentVisit: null,
      isLoading: false,
      isValidating: false,
      error: null,
    });
    mockedUseFeatureFlag.mockReturnValueOnce(false);

    render(<CurrentVisitSummary patientUuid="some-uuid" />);
    expect(screen.getByText(/current visit/i)).toBeInTheDocument();
    expect(screen.getByText('There are no active visit to display for this patient')).toBeInTheDocument();
  });

  test('renders a visit summary when for the active visit', async () => {
    mockGetConfig.mockResolvedValue({ htmlFormEntryForms: [] });
    mockedUseFeatureFlag.mockReturnValueOnce(false);
    mockUseVisits.mockReturnValueOnce({
      currentVisit: {
        uuid: 'some-uuid',
        display: 'Visit 1',
        startDatetime: '2021-03-23T10:00:00.000+0300',
        stopDatetime: null,
        location: {
          uuid: 'some-uuid',
          display: 'Location 1',
        },
        visitType: {
          uuid: 'some-uuid',
          display: 'Visit Type 1',
        },
        encounters: [],
      },
      isLoading: false,
      isValidating: false,
      error: null,
    });
    mockedUseFeatureFlag.mockImplementation(() => ({ activeVisitsSummaryTab: false }));

    render(<CurrentVisitSummary patientUuid="some-uuid" />);

    await waitForLoadingToFinish();

    expect(screen.getByText(/current visit/i)).toBeInTheDocument();
    expect(screen.getByText('Diagnoses')).toBeInTheDocument();
    const buttonNames = ['Notes', 'Tests', 'Medications'];
    buttonNames.forEach((buttonName) => {
      expect(screen.getByRole('tab', { name: buttonName })).toBeInTheDocument();
    });
  });
});
