import React from 'react';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, render, waitFor } from '@testing-library/react';
import { ExtensionSlot, getConfig, getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type ChartConfig, esmPatientChartSchema } from '../../../config-schema';
import { mockPatient } from 'tools';
import { visitOverviewDetailMockData, visitOverviewDetailMockDataNotEmpty } from '__mocks__';
import VisitSummary from './visit-summary.component';
import { useFullVisit } from '../visit.resource';

vi.mock('../visit.resource', async () => ({
  ...((await vi.importActual('../visit.resource')) as object),
  useFullVisit: vi.fn(),
}));

const mockExtensionSlot = ExtensionSlot as Mock;
const mockGetConfig = vi.mocked(getConfig);
const mockUseConfig = vi.mocked(useConfig<ChartConfig>);
const mockUseFullVisit = vi.mocked(useFullVisit);
const mockVisit = visitOverviewDetailMockData.data.results[0];

describe('VisitSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExtensionSlot.mockImplementation((ext) => ext.name);
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientChartSchema),
      notesConceptUuids: ['162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'some-uuid2'],
      visitDiagnosisConceptUuid: '159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    });
    mockUseFullVisit.mockReturnValue({
      visit: null,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });
  });

  it('should display empty state for notes, test and medication summary', async () => {
    const user = userEvent.setup();
    mockGetConfig.mockResolvedValue({ htmlFormEntryForms: [] });

    mockUseFullVisit.mockReturnValue({
      visit: mockVisit,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    render(<VisitSummary patientUuid={mockPatient.id} visit={mockVisit} />);

    expect(screen.getByText(/^Diagnoses$/i)).toBeInTheDocument();
    expect(screen.getByText(/^No diagnoses found$/)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Medication/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Tests/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Notes/i })).toBeInTheDocument();

    const notesTab = screen.getByRole('tab', { name: /Notes/i });
    await user.click(notesTab);

    expect(screen.getByText(/^There are no notes to display for this patient$/)).toBeInTheDocument();

    const medicationTab = screen.getByRole('tab', { name: /Medication/i });
    await user.click(medicationTab);

    await waitFor(() => {
      expect(screen.getByText(/^There are no medications to display for this patient$/)).toBeInTheDocument();
    });

    const testsTab = screen.getByRole('tab', { name: /Tests/i });
    await user.click(testsTab);

    await waitFor(() => {
      expect(screen.getByText(/test-results-filtered-overview/)).toBeInTheDocument();
    });
  });

  it('renders diagnoses tags when there are diagnoses', () => {
    const mockVisit = visitOverviewDetailMockDataNotEmpty.data.results[0];

    mockUseFullVisit.mockReturnValue({
      visit: mockVisit,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    render(<VisitSummary patientUuid={mockPatient.id} visit={mockVisit} />);

    const malariaTag = screen.getByText(/^malaria, confirmed$/i);
    const hivTag = screen.getByText(/human immunodeficiency virus \(hiv\)/i);

    expect(screen.getByText(/^diagnoses$/i)).toBeInTheDocument();
    expect(malariaTag).toBeInTheDocument();
    expect(hivTag).toBeInTheDocument();
  });

  it('should display notes, tests and medication summary', async () => {
    const user = userEvent.setup();

    const mockVisit = visitOverviewDetailMockDataNotEmpty.data.results[0];

    mockUseFullVisit.mockReturnValue({
      visit: mockVisit,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    render(<VisitSummary patientUuid={mockPatient.id} visit={mockVisit} />);

    expect(screen.getByText(/^Diagnoses$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Malaria, confirmed$/)).toBeInTheDocument();
    expect(screen.getByText(/HUMAN IMMUNODEFICIENCY VIRUS/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Medication/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Tests/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Notes/i })).toBeInTheDocument();

    const notesTab = screen.getByRole('tab', { name: /Notes/i });
    await user.click(notesTab);

    expect(screen.getAllByText(/Dr James Cook/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Admin/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/^Patient seems very unwell$/i)).toBeInTheDocument();

    const medicationTab = screen.getByRole('tab', { name: /Medication/i });
    await user.click(medicationTab);

    await waitFor(() => {
      expect(screen.getByRole('tabpanel', { name: /Medication/i })).toBeInTheDocument();
    });

    const testsTab = screen.getByRole('tab', { name: /Tests/i });
    await user.click(testsTab);

    await waitFor(() => {
      expect(screen.getByText(/test-results-filtered-overview/)).toBeInTheDocument();
    });
  });

  it('should show loading state when full visit data is being fetched', async () => {
    const user = userEvent.setup();

    mockUseFullVisit.mockReturnValue({
      visit: null,
      error: undefined,
      isLoading: true,
      isValidating: true,
      mutate: vi.fn(),
    });

    render(<VisitSummary patientUuid={mockPatient.id} visit={mockVisit} />);

    const medicationTab = screen.getByRole('tab', { name: /Medication/i });
    await user.click(medicationTab);

    await waitFor(() => {
      const loadingElements = screen.getAllByText(/Loading visit details/i);
      expect(loadingElements.length).toBeGreaterThan(0);
    });
  });

  it('should trigger full data fetch when clicking a tab that requires it', async () => {
    const user = userEvent.setup();
    const mockVisitData = visitOverviewDetailMockDataNotEmpty.data.results[0];

    mockUseFullVisit.mockReturnValue({
      visit: null,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    const { rerender } = render(<VisitSummary patientUuid={mockPatient.id} visit={mockVisit} />);

    const testsTab = screen.getByRole('tab', { name: /Tests/i });
    await user.click(testsTab);

    mockUseFullVisit.mockReturnValue({
      visit: mockVisitData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    rerender(<VisitSummary patientUuid={mockPatient.id} visit={mockVisit} />);

    await user.click(testsTab);

    await waitFor(() => {
      expect(screen.getByText(/test-results-filtered-overview/)).toBeInTheDocument();
    });
  });

  it('should not trigger full data fetch when clicking the Notes tab', async () => {
    const user = userEvent.setup();

    render(<VisitSummary patientUuid={mockPatient.id} visit={mockVisit} />);

    const notesTab = screen.getByRole('tab', { name: /Notes/i });
    await user.click(notesTab);

    expect(mockUseFullVisit).toHaveBeenCalledWith(null);
  });

  it('should not show infinite loading spinner for tabs before full data is requested', () => {
    mockUseFullVisit.mockReturnValue({
      visit: null,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    render(<VisitSummary patientUuid={mockPatient.id} visit={mockVisit} />);

    expect(screen.queryByText(/Loading visit details/i)).not.toBeInTheDocument();
  });
});
