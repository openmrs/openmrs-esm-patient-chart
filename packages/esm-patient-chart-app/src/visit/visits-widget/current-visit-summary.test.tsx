import React from 'react';
import { render, screen } from '@testing-library/react';
import { getConfig } from '@openmrs/esm-framework';
import { mockPatient, waitForLoadingToFinish } from 'tools';
import { usePatientChartStore } from '@openmrs/esm-patient-common-lib';
import CurrentVisitSummary from './current-visit-summary.extension';

const mockGetConfig = jest.mocked(getConfig);
const mockUsePatientChartStore = jest.mocked(usePatientChartStore);

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  usePatientChartStore: jest.fn(),
}));

describe('CurrentVisitSummary', () => {
  test('renders an empty state when there is no active visit', () => {
    mockUsePatientChartStore.mockReturnValue({
      patientUuid: mockPatient.id,
      patient: mockPatient,
      visitContext: null,
      mutateVisitContext: null,
      setPatient: jest.fn(),
      setVisitContext: jest.fn(),
    });
    render(<CurrentVisitSummary patientUuid={mockPatient.id} />);
    expect(screen.getByText(/current visit/i)).toBeInTheDocument();
    expect(screen.getByText('There are no active visits to display for this patient')).toBeInTheDocument();
  });

  test('returns null when patientUuid does not match store patientUuid', () => {
    mockUsePatientChartStore.mockReturnValue({
      patientUuid: 'different-patient-id',
      patient: mockPatient,
      visitContext: null,
      mutateVisitContext: null,
      setPatient: jest.fn(),
      setVisitContext: jest.fn(),
    });
    render(<CurrentVisitSummary patientUuid={mockPatient.id} />);
    expect(screen.queryByText(/current visit/i)).not.toBeInTheDocument();
  });

  test('renders a visit summary when visit context exists', async () => {
    mockGetConfig.mockResolvedValue({ htmlFormEntryForms: [] });
    mockUsePatientChartStore.mockReturnValue({
      patientUuid: mockPatient.id,
      patient: mockPatient,
      visitContext: {
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
        patient: {
          uuid: mockPatient.id,
          display: 'Test Patient',
        },
      },
      mutateVisitContext: null,
      setPatient: jest.fn(),
      setVisitContext: jest.fn(),
    });

    render(<CurrentVisitSummary patientUuid={mockPatient.id} />);

    await waitForLoadingToFinish();

    expect(screen.getByText(/current visit/i)).toBeInTheDocument();
    expect(screen.getByText('Diagnoses')).toBeInTheDocument();
    const buttonNames = ['Notes', 'Tests', 'Medications', 'Encounters'];
    buttonNames.forEach((buttonName) => {
      expect(screen.getByRole('tab', { name: buttonName })).toBeInTheDocument();
    });
  });
});
