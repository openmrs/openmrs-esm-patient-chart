import { vi, describe, it, expect, test, beforeEach, afterEach } from 'vitest';
import React from 'react';
import {
  ExtensionSlot,
  getDefaultsFromConfigSchema,
  launchWorkspace2,
  showModal,
  useConfig,
  useFeatureFlag,
  userHasAccess,
} from '@openmrs/esm-framework';
import { invalidateVisitAndEncounterData, PRIVILEGE_EDIT_PAST_VISITS } from '@openmrs/esm-patient-common-lib';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockEncountersAlice, mockEncounterTypes, mockFhirPatient, mockPatientAlice } from '__mocks__';
import { renderWithSwr } from 'tools';
import { type EncountersTableProps, useEncounterTypes } from './encounters-table.resource';
import { type ChartConfig, esmPatientChartSchema } from '../../../../config-schema';
import { jsonSchemaResourceName } from '../../../../constants';
import EncountersTable from './encounters-table.component';

const testProps: EncountersTableProps = {
  patientUuid: mockPatientAlice.uuid,
  paginatedEncounters: mockEncountersAlice,
  totalCount: mockEncountersAlice.length,
  currentPage: 1,
  goTo: vi.fn(),
  isLoading: false,
  showVisitType: true,
  showEncounterTypeFilter: false,
  pageSize: 10,
  setPageSize: vi.fn(),
  isSelectable: true,
  canPrintEncounters: true,
  patient: mockFhirPatient,
};

const mockShowModal = vi.mocked(showModal);
const mockLaunchWorkspace = vi.mocked(launchWorkspace2);
const mockUserHasAccess = vi.mocked(userHasAccess).mockReturnValue(true);
const mockUseFeatureFlag = vi.mocked(useFeatureFlag);
const mockExtensionSlot = vi.mocked(ExtensionSlot);

const mockUseEncounterTypes = vi.fn(useEncounterTypes).mockReturnValue({
  data: mockEncounterTypes,
  totalCount: mockEncounterTypes.length,
  hasMore: false,
  loadMore: vi.fn(),
  error: undefined,
  mutate: vi.fn(),
  isValidating: false,
  isLoading: false,
  nextUri: '',
});

const mockUseConfig = vi.mocked(useConfig);

const mockDeleteEncounter = vi.fn();

vi.mock('./encounters-table.resource', async () => ({
  ...((await vi.importActual('./encounters-table.resource')) as object),
  useEncounterTypes: () => mockUseEncounterTypes(),
  deleteEncounter: (...args: Array<unknown>) => mockDeleteEncounter(...args),
}));

vi.mock('@openmrs/esm-patient-common-lib', async () => ({
  ...((await vi.importActual('@openmrs/esm-patient-common-lib')) as object),
  invalidateVisitAndEncounterData: vi.fn(),
}));

beforeEach(() => {
  mockUseFeatureFlag.mockReturnValue(true);
});

describe('EncountersTable', () => {
  it('renders an empty state when no encounters are available', async () => {
    mockUseConfig.mockImplementation((options) => {
      if (options?.externalModuleName === '@openmrs/esm-patient-forms-app') {
        return { htmlFormEntryForms: [] };
      }
      return getDefaultsFromConfigSchema(esmPatientChartSchema);
    });
    renderEncountersTable({ totalCount: 0, paginatedEncounters: [] });

    expect(screen.getByText(/No encounters to display/i)).toBeInTheDocument();
  });

  it("renders a tabular overview of the patient's clinical encounters", async () => {
    renderEncountersTable();

    await screen.findByRole('table');

    const expectedColumnHeaders = [/date & time/, /visit type/, /encounter type/, /form name/, /provider/];
    const expectedTableRows = [
      /select row 18\-jan\-2022, 04:25 pm facility visit admission poc consent form \-\- encounter table actions menu/,
      /select row 03\-aug\-2021, 12:47 am facility visit visit note \-\- user one encounter table actions menu/,
      /select row 05\-jul\-2021, 10:07 am facility visit consultation covid 19 dennis the doctor encounter table actions menu/,
    ];

    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });
    expectedTableRows.forEach((row) => {
      expect(screen.getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument();
    });
  });

  it('passes visit and patient context to embedded form slot state', async () => {
    const user = userEvent.setup();
    mockUseConfig.mockImplementation((options) => {
      if (options?.externalModuleName === '@openmrs/esm-patient-forms-app') {
        return { htmlFormEntryForms: [] };
      }
      return getDefaultsFromConfigSchema(esmPatientChartSchema);
    });
    const encounterWithEmbeddedForm = {
      ...mockEncountersAlice[0],
      form: {
        ...mockEncountersAlice[0].form,
        resources: [
          {
            uuid: 'embedded-form-resource',
            name: jsonSchemaResourceName,
            dataType: 'AmpathJsonSchema',
            valueReference: 'embedded-schema-reference',
          },
        ],
      },
    };

    renderEncountersTable({
      paginatedEncounters: [encounterWithEmbeddedForm],
      totalCount: 1,
    });

    const [expandButton] = screen.getAllByRole('button', { name: /expand current row/i });
    await user.click(expandButton);

    await waitFor(() => {
      expect(mockExtensionSlot.mock.calls.find((call) => call[0].name === 'form-widget-slot')).toBeDefined();
    });

    const formWidgetCall = mockExtensionSlot.mock.calls.find((call) => call[0].name === 'form-widget-slot');
    expect(formWidgetCall?.[0]?.state).toEqual(
      expect.objectContaining({
        visitUuid: encounterWithEmbeddedForm.visit.uuid,
        visitTypeUuid: encounterWithEmbeddedForm.visit.visitType.uuid,
        patientUuid: mockPatientAlice.uuid,
        patient: mockFhirPatient,
      }),
    );
  });

  it('passes null visit context values to embedded form slot state for visitless encounters', async () => {
    const user = userEvent.setup();
    mockUseConfig.mockImplementation((options) => {
      if (options?.externalModuleName === '@openmrs/esm-patient-forms-app') {
        return { htmlFormEntryForms: [] };
      }
      return getDefaultsFromConfigSchema(esmPatientChartSchema);
    });
    const visitlessEncounterWithEmbeddedForm = {
      ...mockEncountersAlice[0],
      visit: null,
      form: {
        ...mockEncountersAlice[0].form,
        resources: [
          {
            uuid: 'visitless-embedded-form-resource',
            name: jsonSchemaResourceName,
            dataType: 'AmpathJsonSchema',
            valueReference: 'visitless-embedded-schema-reference',
          },
        ],
      },
    };

    renderEncountersTable({
      paginatedEncounters: [visitlessEncounterWithEmbeddedForm],
      totalCount: 1,
    });

    const [expandButton] = screen.getAllByRole('button', { name: /expand current row/i });
    await user.click(expandButton);

    await waitFor(() => {
      expect(mockExtensionSlot.mock.calls.find((call) => call[0].name === 'form-widget-slot')).toBeDefined();
    });

    const formWidgetCall = mockExtensionSlot.mock.calls.find((call) => call[0].name === 'form-widget-slot');
    expect(formWidgetCall?.[0]?.state).toEqual(
      expect.objectContaining({
        visitUuid: null,
        visitTypeUuid: null,
        visitStartDatetime: null,
        visitStopDatetime: null,
        patientUuid: mockPatientAlice.uuid,
        patient: mockFhirPatient,
      }),
    );
  });
});

describe('Encounter editability', () => {
  const admissionRowName =
    /Select row 18-Jan-2022, 04:25 PM Facility Visit Admission POC Consent Form -- Encounter table actions menu/i;
  const visitNoteRowName =
    /Select row 03-Aug-2021, 12:47 AM Facility Visit Visit Note -- User One Encounter table actions menu/i;
  const [mockAdmissionEncounter, mockVisitNoteEncounter] = mockEncountersAlice;

  let dateNowSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    dateNowSpy = vi.spyOn(Date, 'now').mockImplementation(() => new Date('2022-01-18T20:00:00.000Z').getTime());
    mockUseConfig.mockImplementation((options) => {
      if (options?.externalModuleName === '@openmrs/esm-patient-forms-app') {
        return { htmlFormEntryForms: [] };
      }
      return getDefaultsFromConfigSchema(esmPatientChartSchema);
    });
    mockUserHasAccess.mockReturnValue(true);
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  it('displays edit and delete encounter buttons by default', async () => {
    mockUserHasAccess.mockImplementation((privilege) => privilege == null || privilege === PRIVILEGE_EDIT_PAST_VISITS);
    const user = userEvent.setup();

    renderEncountersTable();

    const row = screen.getByRole('row', {
      name: /Select row 18-Jan-2022, 04:25 PM Facility Visit Admission POC Consent Form -- Encounter table actions menu/i,
    });

    // Check overflow menu buttons
    await user.click(within(row).getByRole('button', { name: /encounter table actions menu/i }));
    const overflowMenu = screen.getByRole('menu', { hidden: true });
    expect(overflowMenu).toHaveAttribute('aria-label', 'Encounter table actions menu');
    expect(within(overflowMenu).getByText(/edit this encounter/i)).toBeInTheDocument();
    expect(within(overflowMenu).getByText(/Delete this encounter/i)).toBeInTheDocument();
    await user.click(within(row).getByRole('button', { name: /encounter table actions menu/i }));
    expect(screen.queryByRole('menu', { hidden: true })).not.toBeInTheDocument();

    // Check big buttons in expanded row
    await user.click(within(row).getByRole('button', { name: /expand current row/i }));
    expect(screen.getByRole('button', { name: /edit this encounter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /danger\s*Delete this encounter/i })).toBeInTheDocument();
  });

  it('displays edit and delete encounter buttons only if the encounter is within the editable duration', async () => {
    mockUseConfig.mockImplementation((options) => {
      if (options?.externalModuleName === '@openmrs/esm-patient-forms-app') {
        return { htmlFormEntryForms: [] };
      }
      return {
        ...(getDefaultsFromConfigSchema(esmPatientChartSchema) as ChartConfig),
        encounterEditableDuration: 1440,
        encounterEditableDurationOverridePrivileges: ['Super Edit Encounter', 'Magic Superpowers'],
      };
    });
    mockUserHasAccess.mockImplementation((privilege) => privilege == null || privilege === PRIVILEGE_EDIT_PAST_VISITS);

    const user = userEvent.setup();

    renderEncountersTable();

    // Check today's encounter -- should be editable
    const todayRow = screen.getByRole('row', {
      name: /Select row 18-Jan-2022, 04:25 PM Facility Visit Admission POC Consent Form -- Encounter table actions menu/i,
    });

    // Check overflow menu buttons
    await user.click(within(todayRow).getByRole('button', { name: /encounter table actions menu/i }));
    const overflowMenu = screen.getByRole('menu', { hidden: true });
    expect(within(overflowMenu).getByText(/edit this encounter/i)).toBeInTheDocument();
    expect(within(overflowMenu).getByText(/Delete this encounter/i)).toBeInTheDocument();
    await user.click(within(todayRow).getByRole('button', { name: /encounter table actions menu/i }));
    expect(screen.queryByRole('menu', { hidden: true })).not.toBeInTheDocument();

    // Check big buttons in expanded row
    await user.click(within(todayRow).getByRole('button', { name: /expand current row/i }));
    expect(screen.getByRole('button', { name: /edit this encounter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /danger\s*Delete this encounter/i })).toBeInTheDocument();
    await user.click(within(todayRow).getByRole('button', { name: /collapse current row/i }));

    // Check old encounter -- should not be editable
    const oldRow = screen.getByRole('row', {
      name: /Select row 03-Aug-2021, 12:47 AM Facility Visit Visit Note -- User One/i,
    });
    expect(within(oldRow).queryByRole('button', { name: /encounter table actions menu/i })).not.toBeInTheDocument();
    await user.click(within(oldRow).getByRole('button', { name: /expand current row/i }));
    expect(screen.queryByRole('button', { name: /edit this encounter/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /danger\s*Delete this encounter/i })).not.toBeInTheDocument();
  });

  it('displays edit and delete buttons if the user has the override privilege, even if the encounter is outside the editable duration', async () => {
    mockUseConfig.mockImplementation((options) => {
      if (options?.externalModuleName === '@openmrs/esm-patient-forms-app') {
        return { htmlFormEntryForms: [] };
      }
      return {
        ...(getDefaultsFromConfigSchema(esmPatientChartSchema) as ChartConfig),
        encounterEditableDuration: 1440,
        encounterEditableDurationOverridePrivileges: ['Super Edit Encounter', 'Magic Superpowers'],
      };
    });

    mockUserHasAccess.mockImplementation(
      (privilege) => privilege == null || privilege === PRIVILEGE_EDIT_PAST_VISITS || privilege === 'Magic Superpowers',
    );

    const user = userEvent.setup();

    renderEncountersTable();

    const oldRow = screen.getByRole('row', {
      name: /Select row 03-Aug-2021, 12:47 AM Facility Visit Visit Note -- User One Encounter table actions menu/i,
    });

    // Check overflow menu buttons
    await user.click(within(oldRow).getByRole('button', { name: /encounter table actions menu/i }));
    const overflowMenu = screen.getByRole('menu', { hidden: true });
    expect(within(overflowMenu).getByText(/edit this encounter/i)).toBeInTheDocument();
    expect(within(overflowMenu).getByText(/Delete this encounter/i)).toBeInTheDocument();
    await user.click(within(oldRow).getByRole('button', { name: /encounter table actions menu/i }));
    expect(screen.queryByRole('menu', { hidden: true })).not.toBeInTheDocument();

    // Check big buttons in expanded row
    await user.click(within(oldRow).getByRole('button', { name: /expand current row/i }));
    expect(screen.getByRole('button', { name: /edit this encounter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /danger\s*Delete this encounter/i })).toBeInTheDocument();
  });

  it('does not allow editing or deleting encounters of past visits without the edit past visits privilege', async () => {
    mockUserHasAccess.mockImplementation((privilege) => privilege !== PRIVILEGE_EDIT_PAST_VISITS);
    const user = userEvent.setup();

    renderEncountersTable();

    const row = screen.getByRole('row', {
      name: /Select row 18-Jan-2022, 04:25 PM Facility Visit Admission POC Consent Form/i,
    });
    await user.click(within(row).getByRole('button', { name: /expand current row/i }));

    expect(screen.queryByRole('button', { name: /edit this encounter/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete this encounter/i })).not.toBeInTheDocument();
  });

  it('launches the encounter workspace when editing an encounter from the overflow menu', async () => {
    const onEncounterSaved = vi.fn();

    renderEncountersTable({ onEncounterSaved });

    await clickEditEncounterViaOverflowMenu(admissionRowName);

    expect(mockLaunchWorkspace).toHaveBeenCalledTimes(1);
    expect(mockLaunchWorkspace).toHaveBeenCalledWith(
      'encounter-workspace',
      {},
      expect.objectContaining({
        patient: mockFhirPatient,
        visitContext: mockAdmissionEncounter.visit,
        encounter: expect.objectContaining({ uuid: mockAdmissionEncounter.uuid }),
        onEncounterSaved,
      }),
    );
  });

  it('launches the encounter workspace when editing an encounter from the expanded row', async () => {
    const onEncounterSaved = vi.fn();

    renderEncountersTable({ onEncounterSaved });

    await clickEditEncounter(visitNoteRowName);

    expect(mockLaunchWorkspace).toHaveBeenCalledTimes(1);
    expect(mockLaunchWorkspace).toHaveBeenCalledWith(
      'encounter-workspace',
      {},
      expect.objectContaining({
        patient: mockFhirPatient,
        visitContext: mockVisitNoteEncounter.visit,
        encounter: expect.objectContaining(mockVisitNoteEncounter),
        onEncounterSaved,
      }),
    );
  });
});

describe('Delete Encounter', () => {
  beforeEach(() => {
    mockUseConfig.mockImplementation((options) => {
      if (options?.externalModuleName === '@openmrs/esm-patient-forms-app') {
        return { htmlFormEntryForms: [] };
      }
      return getDefaultsFromConfigSchema(esmPatientChartSchema);
    });
    mockUserHasAccess.mockReturnValue(true);
  });

  it('Clicking the `Delete` button deletes an encounter', async () => {
    const user = userEvent.setup();

    renderEncountersTable();

    await screen.findByRole('table');
    expect(screen.getByRole('table')).toBeInTheDocument();

    const row = screen.getByRole('row', {
      name: /Select row 18-Jan-2022, 04:25 PM Facility Visit Admission POC Consent Form -- Encounter table actions menu/i,
    });

    await user.click(within(row).getByRole('button', { name: /expand current row/i }));
    await user.click(screen.getByRole('button', { name: /danger\s*Delete this encounter/i }));

    expect(mockShowModal).toHaveBeenCalledTimes(1);
    expect(mockShowModal).toHaveBeenCalledWith(
      'delete-encounter-modal',
      expect.objectContaining({
        encounterTypeName: 'POC Consent Form',
      }),
    );
  });

  it('calls onEncounterSaved with the deleted encounter once the deletion succeeds', async () => {
    const user = userEvent.setup();
    const onEncounterSaved = vi.fn();
    mockDeleteEncounter.mockResolvedValue({});
    // confirmAndDeleteEncounter calls the disposer showModal hands back.
    mockShowModal.mockReturnValue(vi.fn());

    renderEncountersTable({ onEncounterSaved });

    const row = screen.getByRole('row', {
      name: /Select row 18-Jan-2022, 04:25 PM Facility Visit Admission POC Consent Form -- Encounter table actions menu/i,
    });
    await user.click(within(row).getByRole('button', { name: /expand current row/i }));
    await user.click(screen.getByRole('button', { name: /danger\s*Delete this encounter/i }));

    const [, modalProps] = mockShowModal.mock.calls[0];
    (modalProps as { onConfirmation: () => void }).onConfirmation();

    await waitFor(() => expect(mockDeleteEncounter).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onEncounterSaved).toHaveBeenCalledTimes(1));
    expect(onEncounterSaved).toHaveBeenCalledWith({ uuid: mockEncountersAlice[0].uuid });
    // The visit and encounter data (including the visit shown in the current visit summary) must be refetched
    expect(invalidateVisitAndEncounterData).toHaveBeenCalledWith(expect.any(Function), testProps.patientUuid);
  });
});

function renderEncountersTable(props: Partial<EncountersTableProps> = {}) {
  renderWithSwr(<EncountersTable {...testProps} {...props} />);
}

async function clickEditEncounter(rowName: RegExp) {
  const user = userEvent.setup();
  const row = screen.getByRole('row', { name: rowName });
  await user.click(within(row).getByRole('button', { name: /expand current row/i }));
  await user.click(screen.getByRole('button', { name: /edit this encounter/i }));
}

async function clickEditEncounterViaOverflowMenu(rowName: RegExp) {
  const user = userEvent.setup();
  const row = screen.getByRole('row', { name: rowName });
  await user.click(within(row).getByRole('button', { name: /encounter table actions menu/i }));
  const overflowMenu = screen.getByRole('menu', { hidden: true });
  await user.click(within(overflowMenu).getByText(/edit this encounter/i));
}

describe('EncountersTable print functionality', () => {
  beforeEach(() => {
    mockUseConfig.mockImplementation((options) => {
      if (options?.externalModuleName === '@openmrs/esm-patient-forms-app') {
        return { htmlFormEntryForms: [] };
      }
      return getDefaultsFromConfigSchema(esmPatientChartSchema);
    });
    mockUserHasAccess.mockReturnValue(true);
  });

  it('hides print button and selection checkboxes when canPrintEncounters is false', async () => {
    renderEncountersTable({ isSelectable: true, canPrintEncounters: false, showEncounterTypeFilter: true });

    await screen.findByRole('table');

    expect(screen.queryByRole('button', { name: /print selected/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /select all rows/i })).not.toBeInTheDocument();
  });

  it('shows print button and selection checkboxes when isSelectable and canPrintEncounters are true', async () => {
    renderEncountersTable({ isSelectable: true, canPrintEncounters: true, showEncounterTypeFilter: true });

    await screen.findByRole('table');

    expect(screen.getByRole('button', { name: /print selected/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /select all rows/i })).toBeInTheDocument();
  });

  it('disables print button when no rows are selected', async () => {
    renderEncountersTable({ isSelectable: true, canPrintEncounters: true, showEncounterTypeFilter: true });

    await screen.findByRole('table');

    expect(screen.getByRole('button', { name: /print selected/i })).toBeDisabled();
  });

  it('enables print button after selecting a row', async () => {
    const user = userEvent.setup();
    renderEncountersTable({ isSelectable: true, canPrintEncounters: true, showEncounterTypeFilter: true });

    await screen.findByRole('table');

    const firstRowCheckbox = screen.getAllByRole('checkbox', { name: /select row/i })[0];
    await user.click(firstRowCheckbox);

    expect(screen.getByRole('button', { name: /print selected/i })).toBeEnabled();
  });
});
