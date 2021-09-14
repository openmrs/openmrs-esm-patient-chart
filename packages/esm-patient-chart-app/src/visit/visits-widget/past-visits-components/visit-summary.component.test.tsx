import React from 'react';
import VisitSummary from './visit-summary.component';
import { screen, render } from '@testing-library/react';
import { mockPatient } from '../../../../../../__mocks__/patient.mock';
import {
  visitOverviewDetailMockData,
  visitOverviewDetailMockDataNotEmpty,
} from '../../../../../../__mocks__/visits.mock';
import userEvent from '@testing-library/user-event';
import { ExtensionSlot } from '@openmrs/esm-framework';

const mockEncounter = visitOverviewDetailMockData.data.results[0].encounters.map((encounter) => encounter);
window.HTMLElement.prototype.scrollIntoView = jest.fn();

jest.mock('@openmrs/esm-framework', () => ({
  ExtensionSlot: jest.fn().mockImplementation((ext) => ext.extensionSlotName),
}));

describe('VisitSummary', () => {
  const renderVisitSummary = () => {
    render(<VisitSummary patientUuid={mockPatient.id} encounters={mockEncounter} />);
  };

  it('should display empty state for notes , test and medication summary', () => {
    renderVisitSummary();

    expect(screen.getByText(/^Diagnoses$/i)).toBeInTheDocument();
    expect(screen.getByText(/^No diagnoses found$/)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Medication/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Tests/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Notes/i })).toBeInTheDocument();

    //should display notes tab panel
    const notesTab = screen.getByRole('tab', { name: /Notes/i });
    userEvent.click(notesTab);

    expect(screen.getByText(/^No notes found$/)).toBeInTheDocument();

    // should display medication panel
    const medicationTab = screen.getByRole('tab', { name: /Medication/i });
    userEvent.click(medicationTab);

    expect(screen.getByText(/^No medications found$/)).toBeInTheDocument();

    // should display tests panel with test panel extension
    const testsTab = screen.getByRole('tab', { name: /Tests/i });
    userEvent.click(testsTab);

    expect(screen.getByText(/test-results-filtered-overview/)).toBeInTheDocument();
  });

  it('should display notes, tests and medication summary', () => {
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
    userEvent.click(notesTab);

    expect(screen.getByText(/Dr James Cook/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin/i)).toBeInTheDocument();
    expect(screen.getByText(/^Patient seems very unwell$/i)).toBeInTheDocument();

    // should display medication panel
    const medicationTab = screen.getByRole('tab', { name: /Medication/i });
    userEvent.click(medicationTab);

    // should display tests panel with test panel extension
    const testsTab = screen.getByRole('tab', { name: /Tests/i });
    userEvent.click(testsTab);

    expect(screen.getByText(/test-results-filtered-overview/)).toBeInTheDocument();
  });
});
