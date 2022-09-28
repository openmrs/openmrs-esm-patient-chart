import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  visitOverviewDetailMockData,
  visitOverviewDetailMockDataNotEmpty,
} from '../../../../../../__mocks__/visits.mock';
import { mockPatient } from '../../../../../../__mocks__/patient.mock';
import VisitSummary from './visit-summary.component';

const mockEncounter = visitOverviewDetailMockData.data.results[0].encounters.map((encounter) => encounter);

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    ExtensionSlot: jest.fn().mockImplementation((ext) => ext.extensionSlotName),
    useConfig: jest.fn(() => {
      return {
        notesConceptUuids: ['162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'some-uuid2'],
        visitDiagnosisConceptUuid: '159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        problemListConceptUuid: '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        diagnosisOrderConceptUuid: '159946AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      };
    }),
  };
});

describe('VisitSummary', () => {
  it('should display empty state for notes, test and medication summary', async () => {
    const user = userEvent.setup();

    renderVisitSummary();

    expect(screen.getByText(/^Diagnoses$/i)).toBeInTheDocument();
    expect(screen.getByText(/^No diagnoses found$/)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Medication/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Tests/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Notes/i })).toBeInTheDocument();

    //should display notes tab panel
    const notesTab = screen.getByRole('tab', { name: /Notes/i });

    await waitFor(() => user.click(notesTab));

    expect(screen.getByText(/^No notes found$/)).toBeInTheDocument();

    // should display medication panel
    const medicationTab = screen.getByRole('tab', { name: /Medication/i });

    await waitFor(() => user.click(medicationTab));

    expect(screen.getByText(/^No medications found$/)).toBeInTheDocument();

    // should display tests panel with test panel extension
    const testsTab = screen.getByRole('tab', { name: /Tests/i });

    await waitFor(() => user.click(testsTab));

    expect(screen.getByText(/test-results-filtered-overview/)).toBeInTheDocument();
  });

  it('should display notes, tests and medication summary', async () => {
    const user = userEvent.setup();

    const mockEncounter = visitOverviewDetailMockDataNotEmpty.data.results[0].encounters.map((encounter) => encounter);

    render(<VisitSummary patientUuid={mockPatient.id} encounters={mockEncounter} />);

    expect(screen.getByText(/^Diagnoses$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Malaria, confirmed$/)).toBeInTheDocument();
    expect(screen.getByText(/HUMAN IMMUNODEFICIENCY VIRUS/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Medication/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Tests/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Notes/i })).toBeInTheDocument();

    //should display notes tab panel
    const notesTab = screen.getByRole('tab', { name: /Notes/i });
    await waitFor(() => user.click(notesTab));

    expect(screen.getAllByText(/Dr James Cook/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Admin/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/^Patient seems very unwell$/i)).toBeInTheDocument();

    // should display medication panel
    const medicationTab = screen.getByRole('tab', { name: /Medication/i });
    await waitFor(() => user.click(medicationTab));

    // should display tests panel with test panel extension
    const testsTab = screen.getByRole('tab', { name: /Tests/i });
    await waitFor(() => user.click(testsTab));

    expect(screen.getByText(/test-results-filtered-overview/)).toBeInTheDocument();
  });
});

function renderVisitSummary() {
  render(<VisitSummary patientUuid={mockPatient.id} encounters={mockEncounter} />);
}
