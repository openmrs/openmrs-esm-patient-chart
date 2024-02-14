import React from 'react';
import { getConfig } from '@openmrs/esm-framework';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { visitOverviewDetailMockData, visitOverviewDetailMockDataNotEmpty } from '__mocks__';
import { mockPatient } from 'tools';
import VisitSummary from './visit-summary.component';

const mockVisit = visitOverviewDetailMockData.data.results[0];
const mockGetConfig = getConfig as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    ExtensionSlot: jest.fn().mockImplementation((ext) => ext.name),
    useConfig: jest.fn(() => {
      return {
        notesConceptUuids: ['162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'some-uuid2'],
        visitDiagnosisConceptUuid: '159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        showActiveVisitTab: false,
      };
    }),
    useConnectedExtensions: jest.fn(() => []),
  };
});

describe('VisitSummary', () => {
  it('should display empty state for notes, test and medication summary', async () => {
    const user = userEvent.setup();
    mockGetConfig.mockReturnValue(Promise.resolve({ htmlFormEntryForms: [] }));

    renderVisitSummary();

    expect(screen.getByText(/^Diagnoses$/i)).toBeInTheDocument();
    expect(screen.getByText(/^No diagnoses found$/)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Medication/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Tests/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Notes/i })).toBeInTheDocument();

    //should display notes tab panel
    const notesTab = screen.getByRole('tab', { name: /Notes/i });

    await user.click(notesTab);

    expect(screen.getByText(/^There are no notes to display for this patient$/)).toBeInTheDocument();

    // should display medication panel
    const medicationTab = screen.getByRole('tab', { name: /Medication/i });

    await user.click(medicationTab);

    expect(screen.getByText(/^There are no medications to display for this patient$/)).toBeInTheDocument();

    // should display tests panel with test panel extension
    const testsTab = screen.getByRole('tab', { name: /Tests/i });

    await user.click(testsTab);

    expect(screen.getByText(/test-results-filtered-overview/)).toBeInTheDocument();
  });

  it('should display notes, tests and medication summary', async () => {
    const user = userEvent.setup();

    const mockVisit = visitOverviewDetailMockDataNotEmpty.data.results[0];

    render(<VisitSummary patientUuid={mockPatient.id} visit={mockVisit} />);

    expect(screen.getByText(/^Diagnoses$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Malaria, confirmed$/)).toBeInTheDocument();
    expect(screen.getByText(/HUMAN IMMUNODEFICIENCY VIRUS/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Medication/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Tests/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Notes/i })).toBeInTheDocument();

    //should display notes tab panel
    const notesTab = screen.getByRole('tab', { name: /Notes/i });
    await user.click(notesTab);

    expect(screen.getAllByText(/Dr James Cook/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Admin/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/^Patient seems very unwell$/i)).toBeInTheDocument();

    // should display medication panel
    const medicationTab = screen.getByRole('tab', { name: /Medication/i });
    await user.click(medicationTab);

    // should display tests panel with test panel extension
    const testsTab = screen.getByRole('tab', { name: /Tests/i });
    await user.click(testsTab);

    expect(screen.getByText(/test-results-filtered-overview/)).toBeInTheDocument();
  });
});

function renderVisitSummary() {
  render(<VisitSummary patientUuid={mockPatient.id} visit={mockVisit} />);
}
