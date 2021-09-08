import React from 'react';
import VisitDetailOverview from './visit-detail-overview.component';
import { screen, render, waitFor } from '@testing-library/react';
import { mockPatient } from '../../../../../__mocks__/patient.mock';
import { visitOverviewDetailMockData, visitOverviewDetailMockDataNotEmpty } from '../../../../../__mocks__/visits.mock';
import { getVisitsForPatient, createErrorHandler, useLayoutType, ExtensionSlot } from '@openmrs/esm-framework';
import { of } from 'rxjs';
import userEvent from '@testing-library/user-event';

const mockGetVisitsForPatient = getVisitsForPatient as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  getVisitsForPatient: jest.fn(),
  createErrorHandler: jest.fn(),
  useLayoutType: jest.fn(),
  ExtensionSlot: jest.fn().mockImplementation((ext) => ext.slotName),
}));

describe('VisitDetailOverview', () => {
  const renderVisitDetailOverview = () => {
    mockGetVisitsForPatient.mockReturnValue(of(visitOverviewDetailMockData));
    return render(<VisitDetailOverview patientUuid={mockPatient.id} />);
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render empty state when no visit data is found', () => {
    mockGetVisitsForPatient.mockReturnValue(of({ data: { results: [] } }));
    render(<VisitDetailOverview patientUuid={mockPatient.id} />);

    expect(screen.getByText(/No visits found/)).toBeInTheDocument();
  });

  it('should display detailed visit overview', async () => {
    renderVisitDetailOverview();
    expect(screen.getByText(/^Encounters$/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^All Encounters$/i }).length).toEqual(1);
    expect(screen.getAllByRole('button', { name: /^Visit Summary$/i }).length).toEqual(1);

    const allEncounters = screen.getByRole('button', { name: /^All Encounters$/i });
    userEvent.click(allEncounters);

    expect(screen.getByText(/Vitals/i)).toBeInTheDocument();
    expect(screen.getByText(/Aug 18, 2021 - 01:59/i)).toBeInTheDocument();
    expect(screen.getByText(/ECH/i)).toBeInTheDocument();

    const tableHeaders = ['Time', 'Encounter Type', 'Provider'];
    tableHeaders.forEach((header) => expect(screen.getByText(header)).toBeInTheDocument());

    // should expand vitals
    const expandButton = screen.getByRole('button', { name: /Expand current row/ });
    userEvent.click(expandButton);

    // should display vitals correctly

    expect(screen.getByText(/Pulse:/i)).toBeInTheDocument();
    expect(screen.getByText(/140.0/i)).toBeInTheDocument();
    expect(screen.getByText(/89.0/i)).toBeInTheDocument();
    expect(screen.getByText(/Respiratory rate:/i)).toBeInTheDocument();
    expect(screen.getByText(/35.0/i)).toBeInTheDocument();
    expect(screen.getByText(/Systolic:/i)).toBeInTheDocument();
    expect(screen.getByText(/80.0/i)).toBeInTheDocument();
    expect(screen.getByText(/Diastolic:/i)).toBeInTheDocument();
    expect(screen.getByText(/30.0/i)).toBeInTheDocument();
    expect(screen.getByText(/Temperature /i)).toBeInTheDocument();
    expect(screen.getByText(/^40.0$/i)).toBeInTheDocument();
    expect(screen.getByText(/General patient note:/i)).toBeInTheDocument();
    expect(screen.getByText(/Looks very unwell/i)).toBeInTheDocument();
  });
});
