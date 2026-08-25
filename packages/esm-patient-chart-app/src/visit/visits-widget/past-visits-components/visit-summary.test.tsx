import React from 'react';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, render, within } from '@testing-library/react';
import {
  ExtensionSlot,
  getConfig,
  getDefaultsFromConfigSchema,
  useConfig,
  userHasAccess,
} from '@openmrs/esm-framework';
import { usePatientChartStore } from '@openmrs/esm-patient-common-lib';
import { type ChartConfig, esmPatientChartSchema } from '../../../config-schema';
import { jsonSchemaResourceName } from '../../../constants';
import { mockPatient, renderWithSwr } from 'tools';
import {
  mockEncounterTypes,
  mockFhirPatient,
  visitOverviewDetailMockData,
  visitOverviewDetailMockDataNotEmpty,
} from '__mocks__';
import VisitSummary from './visit-summary.component';
import { useVisitEncounters } from '../visit.resource';

vi.mock('../visit.resource', async () => ({
  ...((await vi.importActual('../visit.resource')) as object),
  useVisitEncounters: vi.fn(),
}));

const mockExtensionSlot = ExtensionSlot as Mock;
const mockGetConfig = vi.mocked(getConfig);
const mockUseConfig = vi.mocked(useConfig<ChartConfig>);
const mockUseVisitEncounters = vi.mocked(useVisitEncounters);
const mockUserHasAccess = vi.mocked(userHasAccess);
const mockUsePatientChartStore = vi.mocked(usePatientChartStore);

const mockVisit = visitOverviewDetailMockData.data.results[0];
const mockVisitNotEmpty = visitOverviewDetailMockDataNotEmpty.data.results[0];

// Without this the encounters table stays in its loading state and renders a skeleton instead of rows
vi.mock('./encounters-table/encounters-table.resource', async () => ({
  ...((await vi.importActual('./encounters-table/encounters-table.resource')) as object),
  useEncounterTypes: () => ({ data: mockEncounterTypes, isLoading: false }),
}));

vi.mock('@openmrs/esm-patient-common-lib', async () => ({
  ...((await vi.importActual('@openmrs/esm-patient-common-lib')) as object),
  usePatientChartStore: vi.fn(),
}));

beforeEach(() => {
  mockUsePatientChartStore.mockReturnValue({
    patientUuid: mockPatient.id,
    patient: mockFhirPatient,
    visitContext: null,
    mutateVisitContext: vi.fn(),
    setPatient: vi.fn(),
    setVisitContext: vi.fn(),
  } as any);
});

describe('VisitSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExtensionSlot.mockImplementation((ext) => ext.name);
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientChartSchema),
      notesConceptUuids: ['162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'some-uuid2'],
      visitDiagnosisConceptUuid: '159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    });
    mockUseVisitEncounters.mockReturnValue({
      encounters: null,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });
  });

  it('should display empty state for notes, test and medication summary', async () => {
    const user = userEvent.setup();
    mockGetConfig.mockResolvedValue({ htmlFormEntryForms: [] });

    mockUseVisitEncounters.mockReturnValue({
      encounters: mockVisit.encounters,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    render(<VisitSummary patientUuid={mockPatient.id} visit={mockVisit} emrapiDiagnoses={[]} />);

    expect(screen.getByText(/^Diagnoses$/i)).toBeInTheDocument();
    expect(screen.getByText(/^No diagnoses found$/)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Medication/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Tests/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Notes/i })).toBeInTheDocument();

    //should display notes tab panel
    const notesTab = screen.getByRole('tab', { name: /Notes/i });
    await user.click(notesTab);

    expect(screen.getByText(/^There are no notes to display for this patient$/)).toBeInTheDocument();

    const medicationTab = screen.getByRole('tab', { name: /Medication/i });
    await user.click(medicationTab);

    expect(screen.getByText(/^There are no medications to display for this patient$/)).toBeInTheDocument();

    const testsTab = screen.getByRole('tab', { name: /Tests/i });
    await user.click(testsTab);

    expect(screen.getByText(/test-results-filtered-overview/)).toBeInTheDocument();
  });

  it('renders diagnoses tags from emrapiDiagnoses', () => {
    const mockDiagnoses = mockVisitNotEmpty.encounters.flatMap((enc) => enc.diagnoses ?? []).filter((d) => !d.voided);

    mockUseVisitEncounters.mockReturnValue({
      encounters: mockVisitNotEmpty.encounters,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    render(<VisitSummary patientUuid={mockPatient.id} visit={mockVisitNotEmpty} emrapiDiagnoses={mockDiagnoses} />);

    const malariaTag = screen.getByText(/^malaria, confirmed$/i);
    const hivTag = screen.getByText(/human immunodeficiency virus \(hiv\)/i);

    expect(screen.getByText(/^diagnoses$/i)).toBeInTheDocument();
    expect(malariaTag).toBeInTheDocument();
    expect(hivTag).toBeInTheDocument();
  });

  it('should display notes, tests and medication summary', async () => {
    const user = userEvent.setup();
    const mockDiagnoses = mockVisitNotEmpty.encounters.flatMap((enc) => enc.diagnoses ?? []).filter((d) => !d.voided);

    mockUseVisitEncounters.mockReturnValue({
      encounters: mockVisitNotEmpty.encounters,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    render(<VisitSummary patientUuid={mockPatient.id} visit={mockVisitNotEmpty} emrapiDiagnoses={mockDiagnoses} />);

    expect(screen.getByText(/^Diagnoses$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Malaria, confirmed$/)).toBeInTheDocument();
    expect(screen.getByText(/HUMAN IMMUNODEFICIENCY VIRUS/i)).toBeInTheDocument();

    //should display notes tab panel
    const notesTab = screen.getByRole('tab', { name: /Notes/i });
    await user.click(notesTab);

    expect(screen.getAllByText(/Dr James Cook/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Admin/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/^Patient seems very unwell$/i)).toBeInTheDocument();

    const medicationTab = screen.getByRole('tab', { name: /Medication/i });
    await user.click(medicationTab);

    expect(screen.getByRole('tabpanel', { name: /Medication/i })).toBeInTheDocument();

    const testsTab = screen.getByRole('tab', { name: /Tests/i });
    await user.click(testsTab);

    expect(screen.getByText(/test-results-filtered-overview/)).toBeInTheDocument();
  });

  it('should show loading state when encounters are being fetched', () => {
    mockUseVisitEncounters.mockReturnValue({
      encounters: null,
      error: undefined,
      isLoading: true,
      isValidating: true,
      mutate: vi.fn(),
    });

    render(<VisitSummary patientUuid={mockPatient.id} visit={mockVisit} emrapiDiagnoses={[]} />);

    const loadingElements = screen.getAllByText(/Loading visit details/i);
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('should show no diagnoses found when emrapiDiagnoses is empty', () => {
    render(<VisitSummary patientUuid={mockPatient.id} visit={mockVisit} emrapiDiagnoses={[]} />);

    expect(screen.getByText(/^No diagnoses found$/)).toBeInTheDocument();
  });
});

describe('VisitSummary encounter editing', () => {
  const mockVisitWithEncounters = visitOverviewDetailMockDataNotEmpty.data.results[0];
  const [mockAdmissionEncounter, mockVisitNoteEncounter] = mockVisitWithEncounters.encounters;

  beforeEach(() => {
    mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(esmPatientChartSchema));
    mockUserHasAccess.mockReturnValue(true);
    mockUseVisitEncounters.mockReturnValue({
      encounters: mockVisitWithEncounters.encounters,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });
  });

  it('passes onEditEncounter down to the encounters tab', async () => {
    const user = userEvent.setup();
    const onEditEncounter = vi.fn();

    renderWithSwr(
      <VisitSummary patientUuid={mockPatient.id} visit={mockVisitWithEncounters} onEditEncounter={onEditEncounter} />,
    );

    await user.click(screen.getByRole('tab', { name: /encounters/i }));
    await clickEditEncounter(/visit note/i);

    expect(onEditEncounter).toHaveBeenCalledTimes(1);
    expect(onEditEncounter).toHaveBeenCalledWith(
      expect.objectContaining({ id: mockVisitNoteEncounter.uuid, encounterType: 'Visit Note' }),
      true,
    );
  });

  it('passes onEditEncounter down to the timeline', async () => {
    const user = userEvent.setup();
    const onEditEncounter = vi.fn();
    const visitWithVisitNoteOnly = { ...mockVisitWithEncounters, encounters: [mockVisitNoteEncounter] };

    mockUseVisitEncounters.mockReturnValue({
      encounters: [mockVisitNoteEncounter],
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    renderWithSwr(
      <VisitSummary patientUuid={mockPatient.id} visit={visitWithVisitNoteOnly} onEditEncounter={onEditEncounter} />,
    );

    // The timeline is the tab the visit summary opens on
    await user.click(screen.getByRole('button', { name: /options/i }));

    const actionsMenu = screen.getByRole('menu', { hidden: true });
    const editItem = within(actionsMenu)
      .getAllByRole('menuitem', { hidden: true })
      .find((menuItem) => /edit this encounter/i.test(menuItem.textContent));
    await user.click(editItem);

    expect(onEditEncounter).toHaveBeenCalledTimes(1);
    expect(onEditEncounter).toHaveBeenCalledWith(
      expect.objectContaining({ id: mockVisitNoteEncounter.uuid, encounterType: 'Visit Note' }),
      true,
    );
  });

  it('passes onEditEncounter down to the completed forms tab', async () => {
    const user = userEvent.setup();
    const onEditEncounter = vi.fn();
    const mockCompletedFormEncounter = {
      ...mockAdmissionEncounter,
      uuid: 'enc-with-schema',
      form: {
        uuid: 'form-with-schema',
        display: 'POC Consent Form',
        resources: [{ uuid: 'r1', name: jsonSchemaResourceName, valueReference: '{}' }],
      },
    };
    const allEncounters = [...mockVisitWithEncounters.encounters, mockCompletedFormEncounter];

    mockUseVisitEncounters.mockReturnValue({
      encounters: allEncounters,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    const visitWithCompletedForm = {
      ...mockVisitWithEncounters,
      encounters: allEncounters,
    };

    renderWithSwr(
      <VisitSummary patientUuid={mockPatient.id} visit={visitWithCompletedForm} onEditEncounter={onEditEncounter} />,
    );

    await user.click(screen.getByRole('tab', { name: /completed forms/i }));
    await clickEditEncounter(/poc consent form/i);

    expect(onEditEncounter).toHaveBeenCalledTimes(1);
    expect(onEditEncounter).toHaveBeenCalledWith(
      expect.objectContaining({ id: mockCompletedFormEncounter.uuid, encounterType: 'Admission' }),
      false,
    );
  });
});

async function clickEditEncounter(rowName: RegExp) {
  const user = userEvent.setup();
  const row = screen.getByRole('row', { name: rowName });
  await user.click(within(row).getByRole('button', { name: /expand current row/i }));
  await user.click(screen.getByRole('button', { name: /edit this encounter/i }));
}
