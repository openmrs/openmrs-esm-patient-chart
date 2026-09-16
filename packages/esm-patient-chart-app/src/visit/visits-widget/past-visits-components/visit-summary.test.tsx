import React from 'react';
import { vi, describe, it, expect, test, beforeEach, type Mock } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, render, waitFor, within } from '@testing-library/react';
import {
  ExtensionSlot,
  getConfig,
  getDefaultsFromConfigSchema,
  showModal,
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

const mockExtensionSlot = ExtensionSlot as Mock;
const mockGetConfig = vi.mocked(getConfig);
const mockUseConfig = vi.mocked(useConfig<ChartConfig>);
const mockUserHasAccess = vi.mocked(userHasAccess);
const mockUsePatientChartStore = vi.mocked(usePatientChartStore);
const mockShowModal = vi.mocked(showModal);
const mockVisit = visitOverviewDetailMockData.data.results[0];

const mockDeleteEncounter = vi.fn();

// Without this the encounters table stays in its loading state and renders a skeleton instead of rows
vi.mock('./encounters-table/encounters-table.resource', async () => ({
  ...((await vi.importActual('./encounters-table/encounters-table.resource')) as object),
  useEncounterTypes: () => ({ data: mockEncounterTypes, isLoading: false }),
  deleteEncounter: (...args: Array<unknown>) => mockDeleteEncounter(...args),
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

describe('VisitSummary encounter editing', () => {
  const mockVisitWithEncounters = visitOverviewDetailMockDataNotEmpty.data.results[0];
  const [mockAdmissionEncounter, mockVisitNoteEncounter] = mockVisitWithEncounters.encounters;

  beforeEach(() => {
    mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(esmPatientChartSchema));
    mockUserHasAccess.mockReturnValue(true);
  });

  it('passes onEditEncounter down to the timeline', async () => {
    const user = userEvent.setup();
    const onEditEncounter = vi.fn();
    // The timeline offers one actions menu per encounter, so keep the visit to the one being edited
    const visitWithVisitNoteOnly = { ...mockVisitWithEncounters, encounters: [mockVisitNoteEncounter] };

    renderWithSwr(
      <VisitSummary patientUuid={mockPatient.id} visit={visitWithVisitNoteOnly} onEditEncounter={onEditEncounter} />,
    );

    // The timeline is the tab the visit summary opens on
    await user.click(screen.getByRole('button', { name: /encounter table actions menu/i }));

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
    const visitWithCompletedForm = {
      ...mockVisitWithEncounters,
      encounters: [...mockVisitWithEncounters.encounters, mockCompletedFormEncounter],
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

describe('VisitSummary encounter deletion', () => {
  const mockVisitWithEncounters = visitOverviewDetailMockDataNotEmpty.data.results[0];
  const [mockAdmissionEncounter, mockVisitNoteEncounter] = mockVisitWithEncounters.encounters;
  const chartMutateVisitContext = vi.fn();

  beforeEach(() => {
    mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(esmPatientChartSchema));
    mockUserHasAccess.mockReturnValue(true);
    mockDeleteEncounter.mockResolvedValue({});
    // confirmAndDeleteEncounter calls the disposer showModal hands back.
    mockShowModal.mockReturnValue(vi.fn());
    mockUsePatientChartStore.mockReturnValue({
      patientUuid: mockPatient.id,
      patient: mockFhirPatient,
      visitContext: null,
      mutateVisitContext: chartMutateVisitContext,
      setPatient: vi.fn(),
      setVisitContext: vi.fn(),
    } as any);
  });

  it('passes mutateVisitContext down to the timeline', async () => {
    const user = userEvent.setup();
    const mutateVisitContext = vi.fn();
    // The timeline offers one actions menu per encounter, so keep the visit to the one being deleted
    const visitWithVisitNoteOnly = { ...mockVisitWithEncounters, encounters: [mockVisitNoteEncounter] };

    renderWithSwr(
      <VisitSummary
        patientUuid={mockPatient.id}
        visit={visitWithVisitNoteOnly}
        mutateVisitContext={mutateVisitContext}
      />,
    );

    // The timeline is the tab the visit summary opens on
    await user.click(screen.getByRole('button', { name: /encounter table actions menu/i }));

    const actionsMenu = screen.getByRole('menu', { hidden: true });
    const deleteItem = within(actionsMenu)
      .getAllByRole('menuitem', { hidden: true })
      .find((menuItem) => /delete this encounter/i.test(menuItem.textContent));
    await user.click(deleteItem);
    confirmDeletion();

    await waitFor(() => expect(mutateVisitContext).toHaveBeenCalledTimes(1));
    expect(chartMutateVisitContext).not.toHaveBeenCalled();
  });

  it('passes mutateVisitContext down to the completed forms tab', async () => {
    const user = userEvent.setup();
    const mutateVisitContext = vi.fn();
    const mockCompletedFormEncounter = {
      ...mockAdmissionEncounter,
      uuid: 'enc-with-schema',
      form: {
        uuid: 'form-with-schema',
        display: 'POC Consent Form',
        resources: [{ uuid: 'r1', name: jsonSchemaResourceName, valueReference: '{}' }],
      },
    };
    const visitWithCompletedForm = {
      ...mockVisitWithEncounters,
      encounters: [...mockVisitWithEncounters.encounters, mockCompletedFormEncounter],
    };

    renderWithSwr(
      <VisitSummary
        patientUuid={mockPatient.id}
        visit={visitWithCompletedForm}
        mutateVisitContext={mutateVisitContext}
      />,
    );

    await user.click(screen.getByRole('tab', { name: /completed forms/i }));
    await clickDeleteEncounter(/poc consent form/i);
    confirmDeletion();

    await waitFor(() => expect(mutateVisitContext).toHaveBeenCalledTimes(1));
    expect(chartMutateVisitContext).not.toHaveBeenCalled();
  });
});

async function clickDeleteEncounter(rowName: RegExp) {
  const user = userEvent.setup();
  const row = screen.getByRole('row', { name: rowName });
  await user.click(within(row).getByRole('button', { name: /expand current row/i }));
  await user.click(screen.getByRole('button', { name: /danger\s*Delete this encounter/i }));
}

function confirmDeletion() {
  const [, modalProps] = mockShowModal.mock.calls[0];
  (modalProps as { onConfirmation: () => void }).onConfirmation();
}

async function clickEditEncounter(rowName: RegExp) {
  const user = userEvent.setup();
  const row = screen.getByRole('row', { name: rowName });
  await user.click(within(row).getByRole('button', { name: /expand current row/i }));
  await user.click(screen.getByRole('button', { name: /edit this encounter/i }));
}
