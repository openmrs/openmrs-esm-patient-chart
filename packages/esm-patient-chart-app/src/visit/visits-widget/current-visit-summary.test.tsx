import React from 'react';
import { render, screen } from '@testing-library/react';
import { getConfig } from '@openmrs/esm-framework';
import { waitForLoadingToFinish } from 'tools';
import CurrentVisitSummary from './current-visit-summary.component';

const mockGetConfig = jest.mocked(getConfig);
const mockUsePatientChartStore = jest.fn();

jest.mock('@openmrs/esm-patient-common-lib', () => {
  return {
    ...jest.requireActual('@openmrs/esm-patient-common-lib'),
    usePatientChartStore: () => mockUsePatientChartStore(),
  };
});

describe('CurrentVisitSummary', () => {
  test('renders an empty state when there is no active visit', () => {
    mockUsePatientChartStore.mockReturnValueOnce({
      visits: {
        activeVisit: null,
        currentVisit: null,
        currentVisitIsRetrospective: false,
        error: null,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      },
    });

    render(<CurrentVisitSummary patientUuid="some-uuid" />);
    expect(screen.getByText(/current visit/i)).toBeInTheDocument();
    expect(screen.getByText('There are no active visit to display for this patient')).toBeInTheDocument();
  });

  test('renders a visit summary when for the active visit', async () => {
    mockGetConfig.mockResolvedValue({ htmlFormEntryForms: [] });
    mockUsePatientChartStore.mockReturnValueOnce({
      visits: {
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
      },
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
