import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { ExtensionSlot, getConfig, getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type ChartConfig, esmPatientChartSchema } from '../../../config-schema';
import { mockPatient } from 'tools';
import { visitOverviewDetailMockData, visitOverviewDetailMockDataNotEmpty } from '__mocks__';
import VisitSummary from './visit-summary.component';

const mockExtensionSlot = ExtensionSlot as jest.Mock;
const mockGetConfig = jest.mocked(getConfig);
const mockUseConfig = jest.mocked(useConfig<ChartConfig>);
const mockVisit = visitOverviewDetailMockData.data.results[0];

describe('VisitSummary', () => {
  beforeEach(() => {
    mockExtensionSlot.mockImplementation((ext) => ext.name);
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientChartSchema),
      notesConceptUuids: ['162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'some-uuid2'],
      visitDiagnosisConceptUuid: '159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    });
  });

  it('should display empty state for notes, test and medication summary', async () => {
    const user = userEvent.setup();
    mockGetConfig.mockResolvedValue({ htmlFormEntryForms: [] });

    render(<VisitSummary patientUuid={mockPatient.id} visit={mockVisit} />);

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

   it('renders diagnoses tags when there are diagnoses', () => {
    const mockVisit = visitOverviewDetailMockDataNotEmpty.data.results[0];

    render(<VisitSummary patientUuid={mockPatient.id} visit={mockVisit} />);

    const malariaTag = screen.getByText(/^malaria, confirmed$/i);
    const hivTag = screen.getByText(/human immunodeficiency virus \(hiv\)/i);

    expect(screen.getByText(/^diagnoses$/i)).toBeInTheDocument();
    expect(malariaTag).toBeInTheDocument();
    expect(hivTag).toBeInTheDocument();

    // eslint-disable-next-line testing-library/no-node-access
    expect(malariaTag.closest('div')).toHaveClass('cds--tag--red');
    // eslint-disable-next-line testing-library/no-node-access
    expect(hivTag.closest('div')).toHaveClass('cds--tag--blue');
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
