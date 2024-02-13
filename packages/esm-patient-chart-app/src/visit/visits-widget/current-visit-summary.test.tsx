import React from 'react';
import { render, screen } from '@testing-library/react';
import { useVisit, getConfig, useFeatureFlag } from '@openmrs/esm-framework';
import { waitForLoadingToFinish } from 'tools';
import CurrentVisitSummary from './current-visit-summary.component';

const mockUseVisits = jest.mocked(useVisit);
const mockGetConfig = jest.mocked(getConfig);
const mockedUseFeatureFlag = useFeatureFlag as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework/mock'),
  useVisits: jest.fn(),
  getConfig: jest.fn(),
}));

describe('CurrentVisitSummary', () => {
  test('renders an empty state when there is no active visit', () => {
    mockUseVisits.mockReturnValueOnce({
      activeVisit: null,
      currentVisit: null,
      currentVisitIsRetrospective: false,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
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
      activeVisit: null,
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
      currentVisitIsRetrospective: false,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });

    render(<CurrentVisitSummary patientUuid="some-uuid" />);

    await waitForLoadingToFinish();

    expect(screen.getByText(/current visit/i)).toBeInTheDocument();
    expect(screen.getByText('Diagnoses')).toBeInTheDocument();
    const buttonNames = ['Notes', 'Tests', 'Medications', 'Encounters'];
    buttonNames.forEach((buttonName) => {
      expect(screen.getByRole('tab', { name: buttonName })).toBeInTheDocument();
    });
  });
});
