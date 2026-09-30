/**
 * @vitest-environment jsdom
 *
 * happy-dom's `AbortController` instances are not the host realm's
 * `AbortController`, so `toHaveBeenCalledWith(new AbortController(), ...)`
 * fails the cross-realm equality check used here.
 */
import React from 'react';
import { vi, expect, test, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, render, waitFor, within } from '@testing-library/react';
import {
  type Encounter,
  getDefaultsFromConfigSchema,
  showSnackbar,
  useConfig,
  useSession,
  useFeatureFlag,
  Workspace2,
  type Visit,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import {
  type PatientWorkspace2DefinitionProps,
  type PatientWorkspaceGroupProps,
} from '@openmrs/esm-patient-common-lib';
import {
  deletePatientDiagnosis,
  fetchDiagnosisConceptsByName,
  savePatientDiagnosis,
  saveVisitNote,
  updateVisitNote,
} from './visit-notes.resource';
import {
  ConfigMock,
  diagnosisSearchResponse,
  mockFetchLocationByUuidResponse,
  mockFetchProviderByUuidResponse,
  mockSessionDataResponse,
} from '__mocks__';
import { configSchema, type ConfigObject } from '../config-schema';
import { mockPatient, getByTextWithMarkup } from 'tools';
import ExportedVisitNotesFormWorkspace, {
  type ExportedVisitNotesFormWorkspaceProps,
} from './exported-visit-notes-form.workspace';
import VisitNotesFormWorkspace, { type VisitNotesFormWorkspaceProps } from './visit-notes-form.workspace';

const defaultProps: PatientWorkspace2DefinitionProps<VisitNotesFormWorkspaceProps, {}> = {
  closeWorkspace: vi.fn(),
  workspaceProps: {
    formContext: 'creating' as const,
  },
  groupProps: {
    patient: mockPatient,
    patientUuid: mockPatient.id,
    visitContext: null,
    mutateVisitContext: null,
  },
  launchChildWorkspace: vi.fn(),
  windowProps: {},
  workspaceName: '',
  windowName: '',
  isRootWorkspace: false,
  showActionMenu: true,
};

function renderVisitNotesForm(
  workspaceProps: Partial<VisitNotesFormWorkspaceProps> = {},
  groupProps: Partial<PatientWorkspaceGroupProps> = {},
) {
  const props = {
    ...defaultProps,
    workspaceProps: { ...defaultProps.workspaceProps, ...workspaceProps },
    groupProps: { ...defaultProps.groupProps, ...groupProps },
  };
  render(<VisitNotesFormWorkspace {...props} />);
}

function renderExportedVisitNotesForm(workspaceProps: Partial<ExportedVisitNotesFormWorkspaceProps> = {}) {
  const props: Workspace2DefinitionProps<ExportedVisitNotesFormWorkspaceProps, {}, {}> = {
    ...defaultProps,
    groupProps: {},
    workspaceProps: {
      formContext: 'creating',
      patient: mockPatient,
      patientUuid: mockPatient.id,
      visitContext: null,
      ...workspaceProps,
    },
  };
  render(<ExportedVisitNotesFormWorkspace {...props} />);
}

function actionsMenuFor(card: HTMLElement) {
  return within(card).getByRole('button', { name: /^actions for /i });
}

/** A preliminary (provisional) row carries a visually hidden "Preliminary" label beside its "?" */
function isMarkedPreliminary(card: HTMLElement) {
  return within(card).queryByText('Preliminary') !== null;
}

/**
 * Certainty is changed through the row's actions menu, not a checkbox. Carbon's floating menu
 * stays visibility: hidden until it is positioned, which empties the menu item's computed
 * accessible name in the test DOM, so the item is targeted by its text.
 */
async function setCertainty(user: ReturnType<typeof userEvent.setup>, card: HTMLElement, preliminary: boolean) {
  await user.click(actionsMenuFor(card));
  await user.click(screen.getByText(preliminary ? /mark as preliminary/i : /mark as confirmed/i));
}

/**
 * Searches for a diagnosis, adds it to the note, and (optionally) sets the Primary checkbox
 * and the certainty of the resulting diagnosis card to a target state. By default Primary is
 * unticked (secondary) and certainty is confirmed.
 */
async function addDiagnosis(
  user: ReturnType<typeof userEvent.setup>,
  name: string,
  { primary, preliminary }: { primary?: boolean; preliminary?: boolean } = {},
) {
  const searchBox = screen.getByPlaceholderText('Search for a diagnosis');
  await user.clear(searchBox);
  await user.type(searchBox, name);
  await user.click(await screen.findByRole('button', { name }));

  const card = screen.getByRole('group', { name });
  // Options are target states (edit mode may render checkboxes already ticked from stored values)
  const setCheckbox = async (checkboxName: string, desired: boolean) => {
    const checkbox = within(card).getByRole('checkbox', { name: checkboxName });
    if ((checkbox as HTMLInputElement).checked !== desired) {
      await user.click(checkbox);
    }
  };
  if (primary != null) {
    await setCheckbox('Primary', primary);
  }
  if (preliminary != null && preliminary !== isMarkedPreliminary(card)) {
    await setCertainty(user, card, preliminary);
  }
  return card;
}

const mockDeletePatientDiagnosis = vi.mocked(deletePatientDiagnosis);
const mockFetchDiagnosisConceptsByName = vi.mocked(fetchDiagnosisConceptsByName);
const mockSavePatientDiagnosis = vi.mocked(savePatientDiagnosis);
const mockSaveVisitNote = vi.mocked(saveVisitNote);
const mockShowSnackbar = vi.mocked(showSnackbar);
const mockUpdateVisitNote = vi.mocked(updateVisitNote);
const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseSession = vi.mocked(useSession);
const mockedUseFeatureFlag = vi.mocked(useFeatureFlag);

vi.mock('lodash-es/debounce', () => vi.fn((fn) => fn));

vi.mock('./visit-notes.resource', () => ({
  deletePatientDiagnosis: vi.fn(),
  fetchDiagnosisConceptsByName: vi.fn(),
  savePatientDiagnosis: vi.fn(),
  updateVisitNote: vi.fn(),
  useLocationUuid: vi.fn().mockImplementation(() => ({
    data: mockFetchLocationByUuidResponse.data.uuid,
  })),
  useProviderUuid: vi.fn().mockImplementation(() => ({
    data: mockFetchProviderByUuidResponse.data.uuid,
  })),
  saveVisitNote: vi.fn(),
  useVisitNotes: vi.fn().mockImplementation(() => ({
    mutateVisitNotes: vi.fn(),
  })),
}));

mockUseSession.mockReturnValue(mockSessionDataResponse.data);
mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  ...ConfigMock,
});

beforeEach(() => {
  mockedUseFeatureFlag.mockReturnValue(false);
});

test('does not render the date picker when RDE is disabled', () => {
  renderVisitNotesForm();

  expect(screen.queryByLabelText(/visit date/i)).not.toBeInTheDocument();
});

test('renders the date picker when RDE is enabled', () => {
  mockedUseFeatureFlag.mockReturnValue(true);

  renderVisitNotesForm();

  expect(screen.getByLabelText(/visit date/i)).toBeInTheDocument();
});

test('renders the visit notes form with all the relevant fields and values', () => {
  mockFetchDiagnosisConceptsByName.mockResolvedValue([]);

  renderVisitNotesForm();

  expect(screen.getByText('Add visit note', { exact: true })).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: /write your notes/i })).toBeInTheDocument();
  expect(screen.getByRole('searchbox', { name: /search for a diagnosis to add/i })).toBeInTheDocument();
  // The defaults helper text only appears once a diagnosis has been added
  expect(screen.queryByText(/diagnoses are recorded as confirmed unless marked preliminary/i)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /add image/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /discard/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /save and close/i })).toBeInTheDocument();
});

test('typing in the diagnosis search input triggers a search', async () => {
  const user = userEvent.setup();

  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);

  renderVisitNotesForm();

  const searchBox = screen.getByPlaceholderText('Search for a diagnosis');
  await user.type(searchBox, 'Diabetes Mellitus');

  // Wait for the search results to appear
  const targetSearchResult = await screen.findByRole('button', { name: 'Diabetes Mellitus' });
  expect(targetSearchResult).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Diabetes Mellitus, Type II' })).toBeInTheDocument();

  // Clicking a search result displays the selected diagnosis as a card under the shared
  // Primary column header. Nothing is auto-marked primary and certainty is confirmed by
  // default, so Primary starts unticked (secondary) and no preliminary mark is shown
  await user.click(targetSearchResult);
  const card = screen.getByRole('group', { name: 'Diabetes Mellitus' });
  expect(screen.getByText(/diagnoses are recorded as confirmed unless marked preliminary/i)).toBeInTheDocument();
  expect(within(card).getByRole('checkbox', { name: 'Primary' })).not.toBeChecked();
  expect(within(card).queryByRole('checkbox', { name: 'Confirmed' })).not.toBeInTheDocument();
  expect(isMarkedPreliminary(card)).toBe(false);

  // Ticking Primary promotes it; the row's actions menu marks it preliminary (a leading "?")
  await user.click(within(card).getByRole('checkbox', { name: 'Primary' }));
  await setCertainty(user, card, true);
  expect(within(card).getByRole('checkbox', { name: 'Primary' })).toBeChecked();
  expect(isMarkedPreliminary(card)).toBe(true);
  expect(within(card).getByText('?')).toBeInTheDocument();

  // Clicking the remove button on the card removes the selected diagnosis
  await user.click(within(card).getByRole('button', { name: /remove diabetes mellitus/i }));
  // no selected diagnoses left
  expect(screen.getByText(/No diagnosis selected — Enter a diagnosis above/i)).toBeInTheDocument();
});

test('renders an error message when no matching diagnoses are found', async () => {
  const user = userEvent.setup();
  mockFetchDiagnosisConceptsByName.mockResolvedValue([]);

  renderVisitNotesForm();

  const searchBox = screen.getByPlaceholderText('Search for a diagnosis');
  await user.type(searchBox, 'COVID-21');

  await screen.findByText(/No diagnoses found/i);
  expect(getByTextWithMarkup('No diagnoses found matching "COVID-21"')).toBeInTheDocument();
});

test('closes the form and the workspace when the cancel button is clicked', async () => {
  const user = userEvent.setup();

  renderVisitNotesForm();

  const cancelButton = screen.getByRole('button', { name: /Discard/i });
  await user.click(cancelButton);

  expect(defaultProps.closeWorkspace).toHaveBeenCalledTimes(1);
});

test('renders a success snackbar upon successfully recording a visit note', async () => {
  const user = userEvent.setup();
  const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

  const successPayload = {
    encounterProviders: expect.arrayContaining([
      {
        encounterRole: ConfigMock.visitNoteConfig.clinicianEncounterRole,
        provider: mockSessionDataResponse.data.currentProvider.uuid,
      },
    ]),
    encounterType: ConfigMock.visitNoteConfig.encounterTypeUuid,
    form: ConfigMock.visitNoteConfig.formConceptUuid,
    location: mockSessionDataResponse.data.sessionLocation.uuid,
    obs: expect.arrayContaining([
      {
        concept: { display: '', uuid: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
        value: 'Sample clinical note',
      },
    ]),
    patient: mockPatient.id,
    encounterDatetime: undefined,
  };

  mockSaveVisitNote.mockResolvedValueOnce({
    status: 201,
    data: { uuid: 'new-encounter-uuid' },
  } as unknown as Awaited<ReturnType<typeof saveVisitNote>>);
  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);

  renderVisitNotesForm();

  const clinicalNote = screen.getByRole('textbox', { name: /Write your notes/i });
  await user.type(clinicalNote, 'x');
  const submitButton = screen.getByRole('button', { name: /Save and close/i });
  await user.click(submitButton);

  // With nothing selected yet, the failed save reports the requirement and focuses the search input
  expect(screen.getByText(/choose at least one primary diagnosis/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Search for a diagnosis')).toHaveFocus();

  // A newly added diagnosis is never auto-ticked primary — the choice stays explicit
  const card = await addDiagnosis(user, 'Diabetes Mellitus');
  expect(within(card).getByRole('checkbox', { name: 'Primary' })).not.toBeChecked();

  // The requirement is already showing live (a diagnosis exists, none primary); submitting
  // keeps that single warning, leaves the Primary checkbox neutral and focuses it for the fix
  expect(screen.getAllByText(/choose at least one primary diagnosis/i)).toHaveLength(1);
  await user.click(submitButton);
  expect(screen.getAllByText(/choose at least one primary diagnosis/i)).toHaveLength(1);
  expect(within(card).getByRole('checkbox', { name: 'Primary' })).not.toHaveAttribute('data-invalid');
  expect(within(card).getByRole('checkbox', { name: 'Primary' })).toHaveFocus();
  expect(mockSaveVisitNote).not.toHaveBeenCalled();

  // Ticking Primary clears the error without another submit; certainty stays confirmed
  await user.click(within(card).getByRole('checkbox', { name: 'Primary' }));
  expect(screen.queryByText(/choose at least one primary diagnosis/i)).not.toBeInTheDocument();

  await user.clear(clinicalNote);
  await user.type(clinicalNote, 'Sample clinical note');
  expect(clinicalNote).toHaveValue('Sample clinical note');

  await user.click(submitButton);

  expect(mockSaveVisitNote).toHaveBeenCalledTimes(1);
  expect(mockSaveVisitNote).toHaveBeenCalledWith(new AbortController(), expect.objectContaining(successPayload));

  // The chosen order and certainty are transmitted on the diagnosis payload
  await waitFor(() =>
    expect(mockSavePatientDiagnosis).toHaveBeenCalledWith(
      expect.any(AbortController),
      expect.objectContaining({
        certainty: 'CONFIRMED',
        rank: 1,
        diagnosis: { coded: '119481AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
        encounter: 'new-encounter-uuid',
      }),
    ),
  );
  mockConsoleError.mockRestore();
});

test('attaches the visit from the visit context to a newly created note', async () => {
  const user = userEvent.setup();

  mockSaveVisitNote.mockResolvedValueOnce({ status: 201, body: 'Condition created' } as unknown as Awaited<
    ReturnType<typeof saveVisitNote>
  >);
  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);

  renderVisitNotesForm({}, { visitContext: { uuid: 'visit-context-uuid' } as Visit });

  await addDiagnosis(user, 'Diabetes Mellitus', { primary: true });

  await user.type(screen.getByRole('textbox', { name: /Write your notes/i }), 'Sample clinical note');
  await user.click(screen.getByRole('button', { name: /Save and close/i }));

  expect(mockSaveVisitNote).toHaveBeenCalledWith(
    new AbortController(),
    expect.objectContaining({ visit: 'visit-context-uuid' }),
  );
});

test('omits the visit when there is no visit context', async () => {
  const user = userEvent.setup();

  mockSaveVisitNote.mockResolvedValueOnce({ status: 201, body: 'Condition created' } as unknown as Awaited<
    ReturnType<typeof saveVisitNote>
  >);
  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);

  renderVisitNotesForm();

  await addDiagnosis(user, 'Diabetes Mellitus', { primary: true });

  await user.type(screen.getByRole('textbox', { name: /Write your notes/i }), 'Sample clinical note');
  await user.click(screen.getByRole('button', { name: /Save and close/i }));

  expect(mockSaveVisitNote).toHaveBeenCalledWith(
    new AbortController(),
    expect.not.objectContaining({ visit: expect.anything() }),
  );
});

test('attaches the visit supplied by an out-of-chart launcher to a newly created note', async () => {
  const user = userEvent.setup();

  mockSaveVisitNote.mockResolvedValueOnce({ status: 201, body: 'Condition created' } as unknown as Awaited<
    ReturnType<typeof saveVisitNote>
  >);
  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);

  renderExportedVisitNotesForm({ visitContext: { uuid: 'visit-context-uuid' } as Visit });

  await addDiagnosis(user, 'Diabetes Mellitus', { primary: true });

  await user.type(screen.getByRole('textbox', { name: /Write your notes/i }), 'Sample clinical note');
  await user.click(screen.getByRole('button', { name: /Save and close/i }));

  expect(mockSaveVisitNote).toHaveBeenCalledWith(
    new AbortController(),
    expect.objectContaining({ visit: 'visit-context-uuid' }),
  );
});

test('renders an error snackbar if there was a problem recording a condition', async () => {
  const user = userEvent.setup();

  const error = {
    message: 'Internal Server Error',
    response: {
      status: 500,
      statusText: 'Internal Server Error',
    },
  };

  mockSaveVisitNote.mockRejectedValueOnce(error);
  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);

  renderVisitNotesForm();

  const submitButton = screen.getByRole('button', { name: /Save and close/i });

  await addDiagnosis(user, 'Diabetes Mellitus', { primary: true });

  const clinicalNote = screen.getByRole('textbox', { name: /Write your notes/i });
  await user.clear(clinicalNote);
  await user.type(clinicalNote, 'Sample clinical note');
  expect(clinicalNote).toHaveValue('Sample clinical note');

  await user.click(submitButton);

  expect(mockShowSnackbar).toHaveBeenCalledWith({
    isLowContrast: false,
    kind: 'error',
    subtitle: 'Internal Server Error',
    title: 'Error saving visit note',
  });
});

test('initializes form with existing encounter data when in edit mode', () => {
  mockedUseFeatureFlag.mockReturnValue(true);

  const mockEncounter = {
    id: '123',
    uuid: '123',
    datetime: '20/03/2024',
    rawDatetime: '2024-03-20T10:00:00.000Z',
    obs: [
      {
        concept: { uuid: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
        value: 'Existing clinical note',
      },
    ],
    diagnoses: [
      {
        uuid: '456',
        diagnosis: {
          coded: { uuid: '789', display: 'Diabetes Mellitus' },
        },
        certainty: 'PROVISIONAL',
        rank: 1,
        display: 'Diabetes Mellitus',
      },
    ],
  };

  renderVisitNotesForm({
    formContext: 'editing',
    encounter: mockEncounter as any as Encounter, // TODO: fix
  });

  // Verify date is pre-filled
  expect(screen.getByLabelText(/visit date/i)).toHaveValue('20/03/2024');

  // Verify edit mode is reflected in the workspace title
  expect(screen.getByText('Edit visit note', { exact: true })).toBeInTheDocument();

  // Verify clinical note is pre-filled
  expect(screen.getByRole('textbox', { name: /write your notes/i })).toHaveValue('Existing clinical note');

  // Verify diagnosis is pre-filled from its stored rank and certainty: rank 1 ticks
  // Primary, and the stored PROVISIONAL shows the preliminary mark
  const card = screen.getByRole('group', { name: 'Diabetes Mellitus' });
  expect(within(card).getByRole('checkbox', { name: 'Primary' })).toBeChecked();
  expect(isMarkedPreliminary(card)).toBe(true);
});

test('updates existing visit note when in edit mode', async () => {
  const user = userEvent.setup();
  const mockEncounter = {
    id: '123',
    uuid: '123',
    datetime: '20/03/2024',
    rawDatetime: '2024-03-20T10:00:00.000Z',
    obs: [
      {
        concept: { uuid: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
        value: 'Existing clinical note',
      },
    ],
    diagnoses: [
      {
        uuid: '456',
        diagnosis: {
          coded: { uuid: '789', display: 'Diabetes Mellitus' },
        },
        certainty: 'PROVISIONAL',
        rank: 1,
        display: 'Diabetes Mellitus',
      },
    ],
  };

  const updatePayload = {
    encounterProviders: [
      {
        encounterRole: ConfigMock.visitNoteConfig.clinicianEncounterRole,
        provider: mockSessionDataResponse.data.currentProvider.uuid,
      },
    ],
    encounterType: ConfigMock.visitNoteConfig.encounterTypeUuid,
    form: ConfigMock.visitNoteConfig.formConceptUuid,
    location: mockSessionDataResponse.data.sessionLocation.uuid,
    obs: [
      {
        concept: { display: '', uuid: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
        value: 'Updated clinical note',
        uuid: undefined,
      },
    ],
    patient: mockPatient.id,
    encounterDatetime: undefined,
  };

  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);
  mockUpdateVisitNote.mockResolvedValueOnce({ status: 200, body: 'Visit note updated' } as unknown as Awaited<
    ReturnType<typeof updateVisitNote>
  >);

  renderVisitNotesForm({
    formContext: 'editing',
    encounter: mockEncounter as any as Encounter, // TODO: fix
  });

  // Update clinical note
  const clinicalNote = screen.getByRole('textbox', { name: /Write your notes/i });
  await user.clear(clinicalNote);
  await user.type(clinicalNote, 'Updated clinical note');
  expect(clinicalNote).toHaveValue('Updated clinical note');

  // Submit form
  const submitButton = screen.getByRole('button', { name: /Save and close/i });
  await user.click(submitButton);

  expect(mockUpdateVisitNote).toHaveBeenCalledWith(
    expect.any(AbortController),
    mockEncounter.id,
    expect.objectContaining(updatePayload),
  );
});

test('handles existing diagnoses correctly when in edit mode', async () => {
  const user = userEvent.setup();
  const mockEncounter = {
    id: '123',
    uuid: '123',
    datetime: '20/03/2024',
    rawDatetime: '2024-03-20T10:00:00.000Z',
    diagnoses: [
      {
        uuid: '456',
        diagnosis: {
          coded: { uuid: '789', display: 'Diabetes Mellitus' },
        },
        certainty: 'PROVISIONAL',
        rank: 1,
        display: 'Diabetes Mellitus',
      },
    ],
  };

  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);

  renderVisitNotesForm({
    formContext: 'editing',
    encounter: mockEncounter,
  });

  // Verify existing diagnosis is displayed
  expect(screen.getByRole('group', { name: 'Diabetes Mellitus' })).toBeInTheDocument();

  // Remove existing diagnosis
  await user.click(screen.getByRole('button', { name: /remove diabetes mellitus/i }));

  // Verify no diagnoses are selected
  expect(screen.getByText(/No diagnosis selected — Enter a diagnosis above/i)).toBeInTheDocument();

  // Add new diagnosis
  await addDiagnosis(user, 'Diabetes Mellitus');

  // Verify new diagnosis is displayed
  expect(screen.getByRole('group', { name: 'Diabetes Mellitus' })).toBeInTheDocument();
});

test('preserves CONFIRMED certainty on diagnoses when re-saving a visit note in edit mode', async () => {
  const user = userEvent.setup();
  const mockEncounter = {
    id: '123',
    uuid: '123',
    datetime: '20/03/2024',
    rawDatetime: '2024-03-20T10:00:00.000Z',
    obs: [
      {
        concept: { uuid: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
        value: 'Existing clinical note',
      },
    ],
    diagnoses: [
      {
        uuid: '456',
        diagnosis: {
          coded: { uuid: '789', display: 'Diabetes Mellitus' },
        },
        certainty: 'CONFIRMED',
        rank: 1,
        display: 'Diabetes Mellitus',
      },
    ],
  };

  mockUpdateVisitNote.mockResolvedValueOnce({ status: 200, body: 'Visit note updated' } as unknown as Awaited<
    ReturnType<typeof updateVisitNote>
  >);

  renderVisitNotesForm({
    formContext: 'editing',
    encounter: mockEncounter as unknown as Encounter,
  });

  // A stored CONFIRMED diagnosis carries no preliminary mark
  const card = screen.getByRole('group', { name: 'Diabetes Mellitus' });
  expect(isMarkedPreliminary(card)).toBe(false);

  // Marking it preliminary and then confirmed again leaves the diagnoses unchanged, so Save
  // stays disabled until a real edit is made; the original CONFIRMED value must still be sent
  await setCertainty(user, card, true);
  expect(screen.getByRole('button', { name: /Save and close/i })).toBeEnabled();
  expect(vi.mocked(Workspace2).mock.lastCall?.[0].hasUnsavedChanges).toBe(true);
  await setCertainty(user, card, false);
  const submitButton = screen.getByRole('button', { name: /Save and close/i });
  expect(submitButton).toBeDisabled();
  expect(vi.mocked(Workspace2).mock.lastCall?.[0].hasUnsavedChanges).toBe(false);
  await user.type(screen.getByRole('textbox', { name: /write your notes/i }), ' (edited)');

  await user.click(submitButton);

  // The edit path deletes and recreates the encounter's diagnoses, so certainty set by
  // other writers (e.g. REST clients writing CONFIRMED) must survive the round-trip.
  await waitFor(() =>
    expect(mockSavePatientDiagnosis).toHaveBeenCalledWith(
      expect.any(AbortController),
      expect.objectContaining({
        certainty: 'CONFIRMED',
        rank: 1,
        diagnosis: { coded: '789' },
      }),
    ),
  );
  expect(mockDeletePatientDiagnosis).toHaveBeenCalledWith(expect.any(AbortController), '456');
});

test('allows saving visit note without primary diagnosis when isPrimaryDiagnosisRequired is false', async () => {
  const user = userEvent.setup();

  mockUseConfig.mockReturnValue({
    ...getDefaultsFromConfigSchema(configSchema),
    ...ConfigMock,
    isPrimaryDiagnosisRequired: false,
  });

  const successPayload = {
    encounterProviders: expect.arrayContaining([
      {
        encounterRole: ConfigMock.visitNoteConfig.clinicianEncounterRole,
        provider: mockSessionDataResponse.data.currentProvider.uuid,
      },
    ]),
    encounterType: ConfigMock.visitNoteConfig.encounterTypeUuid,
    form: ConfigMock.visitNoteConfig.formConceptUuid,
    location: mockSessionDataResponse.data.sessionLocation.uuid,
    obs: expect.arrayContaining([
      {
        concept: { display: '', uuid: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
        value: 'Clinical note without diagnosis',
      },
    ]),
    patient: mockPatient.id,
    encounterDatetime: undefined,
  };

  mockSaveVisitNote.mockResolvedValueOnce({ status: 201, body: 'Visit note created' } as unknown as Awaited<
    ReturnType<typeof saveVisitNote>
  >);
  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);

  renderVisitNotesForm();

  const clinicalNote = screen.getByRole('textbox', { name: /Write your notes/i });
  await user.clear(clinicalNote);
  await user.type(clinicalNote, 'Clinical note without diagnosis');
  expect(clinicalNote).toHaveValue('Clinical note without diagnosis');

  const submitButton = screen.getByRole('button', { name: /Save and close/i });
  await user.click(submitButton);

  // Should not show validation error for missing primary diagnosis
  expect(screen.queryByText(/choose at least one primary diagnosis/i)).not.toBeInTheDocument();

  // Should successfully save the visit note
  expect(mockSaveVisitNote).toHaveBeenCalledTimes(1);
  expect(mockSaveVisitNote).toHaveBeenCalledWith(new AbortController(), expect.objectContaining(successPayload));

  // Reset mock for other tests
  mockUseConfig.mockReturnValue({
    ...getDefaultsFromConfigSchema(configSchema),
    ...ConfigMock,
  });
});

test('requires primary diagnosis when isPrimaryDiagnosisRequired is true', async () => {
  const user = userEvent.setup();

  mockUseConfig.mockReturnValue({
    ...getDefaultsFromConfigSchema(configSchema),
    ...ConfigMock,
    isPrimaryDiagnosisRequired: true,
  });

  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);

  renderVisitNotesForm();

  const clinicalNote = screen.getByRole('textbox', { name: /Write your notes/i });
  await user.clear(clinicalNote);
  await user.type(clinicalNote, 'Clinical note without diagnosis');

  const submitButton = screen.getByRole('button', { name: /save and close/i });
  await user.click(submitButton);

  // Should show validation error for missing primary diagnosis
  expect(screen.getByText(/choose at least one primary diagnosis/i)).toBeInTheDocument();

  // Should not attempt to save
  expect(mockSaveVisitNote).not.toHaveBeenCalled();

  // The requirement belongs to the diagnosis group: with several diagnoses and no primary,
  // the message renders once, both Primary checkboxes stay neutral, and the failed save
  // focuses the topmost (most recently added) card's Primary
  const firstCard = await addDiagnosis(user, 'Diabetes Mellitus', { primary: false });
  const topCard = await addDiagnosis(user, 'Diabetes Mellitus, Type II', { primary: false });
  await user.click(submitButton);

  expect(screen.getAllByText(/choose at least one primary diagnosis/i)).toHaveLength(1);
  expect(within(firstCard).getByRole('checkbox', { name: 'Primary' })).not.toHaveAttribute('data-invalid');
  expect(within(topCard).getByRole('checkbox', { name: 'Primary' })).not.toHaveAttribute('data-invalid');
  expect(within(topCard).getByRole('checkbox', { name: 'Primary' })).toHaveFocus();
  expect(mockSaveVisitNote).not.toHaveBeenCalled();

  // Ticking any primary clears the group message without another submit
  await user.click(within(firstCard).getByRole('checkbox', { name: 'Primary' }));
  expect(screen.queryByText(/choose at least one primary diagnosis/i)).not.toBeInTheDocument();

  // Reset mock for other tests
  mockUseConfig.mockReturnValue({
    ...getDefaultsFromConfigSchema(configSchema),
    ...ConfigMock,
  });
});

test('presumes secondary and confirmed for out-of-enum rank and certainty from other writers', async () => {
  const user = userEvent.setup();

  mockUseConfig.mockReturnValue({
    ...getDefaultsFromConfigSchema(configSchema),
    ...ConfigMock,
    isPrimaryDiagnosisRequired: false,
  });

  const mockEncounter = {
    id: '123',
    uuid: '123',
    datetime: '20/03/2024',
    rawDatetime: '2024-03-20T10:00:00.000Z',
    diagnoses: [
      {
        uuid: '456',
        diagnosis: {
          coded: { uuid: '789', display: 'Diabetes Mellitus' },
        },
        certainty: 'PRESUMED',
        rank: 0,
        display: 'Diabetes Mellitus',
      },
    ],
  };

  mockUpdateVisitNote.mockResolvedValueOnce({ status: 200, body: 'Visit note updated' } as unknown as Awaited<
    ReturnType<typeof updateVisitNote>
  >);

  renderVisitNotesForm({
    formContext: 'editing',
    encounter: mockEncounter as unknown as Encounter,
  });

  // Out-of-enum values fall back to the presumed defaults: secondary (Primary unticked)
  // and confirmed (no preliminary mark)
  const card = screen.getByRole('group', { name: 'Diabetes Mellitus' });
  expect(within(card).getByRole('checkbox', { name: 'Primary' })).not.toBeChecked();
  expect(isMarkedPreliminary(card)).toBe(false);

  // Saving proceeds with the presumed values rather than blocking on a per-card choice
  const clinicalNote = screen.getByRole('textbox', { name: /Write your notes/i });
  await user.type(clinicalNote, ' updated');
  await user.click(screen.getByRole('button', { name: /Save and close/i }));

  await waitFor(() =>
    expect(mockSavePatientDiagnosis).toHaveBeenCalledWith(
      expect.any(AbortController),
      expect.objectContaining({
        certainty: 'CONFIRMED',
        rank: 2,
        diagnosis: { coded: '789' },
      }),
    ),
  );

  mockUseConfig.mockReturnValue({
    ...getDefaultsFromConfigSchema(configSchema),
    ...ConfigMock,
  });
});

test('saves the confirmed default and records a diagnosis marked preliminary as provisional', async () => {
  const user = userEvent.setup();

  mockSaveVisitNote.mockResolvedValueOnce({
    status: 201,
    data: { uuid: 'new-encounter-uuid' },
  } as unknown as Awaited<ReturnType<typeof saveVisitNote>>);
  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);

  renderVisitNotesForm();

  // One primary diagnosis (confirmed by default), one secondary marked preliminary
  await addDiagnosis(user, 'Diabetes Mellitus', { primary: true });
  await addDiagnosis(user, 'Diabetes Mellitus, Type II', { preliminary: true });

  await user.type(screen.getByRole('textbox', { name: /Write your notes/i }), 'Sample clinical note');
  await user.click(screen.getByRole('button', { name: /save and close/i }));

  // The primary keeps the presumed confirmed certainty (no tick needed)
  await waitFor(() =>
    expect(mockSavePatientDiagnosis).toHaveBeenCalledWith(
      expect.any(AbortController),
      expect.objectContaining({ certainty: 'CONFIRMED', rank: 1 }),
    ),
  );
  // Marking the secondary preliminary transmits the PROVISIONAL certainty
  expect(mockSavePatientDiagnosis).toHaveBeenCalledWith(
    expect.any(AbortController),
    expect.objectContaining({ certainty: 'PROVISIONAL', rank: 2 }),
  );
  expect(mockSavePatientDiagnosis).toHaveBeenCalledTimes(2);
});

test('marks Primary and preliminary independently across multiple diagnosis cards', async () => {
  const user = userEvent.setup();

  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);

  renderVisitNotesForm();

  // Both cards start unticked and confirmed; changing one leaves the other alone
  const firstCard = await addDiagnosis(user, 'Diabetes Mellitus', { primary: true });
  const secondCard = await addDiagnosis(user, 'Diabetes Mellitus, Type II');

  // Marking the first card preliminary through its actions menu does not touch the second
  await setCertainty(user, firstCard, true);

  expect(within(firstCard).getByRole('checkbox', { name: 'Primary' })).toBeChecked();
  expect(isMarkedPreliminary(firstCard)).toBe(true);
  expect(within(secondCard).getByRole('checkbox', { name: 'Primary' })).not.toBeChecked();
  expect(isMarkedPreliminary(secondCard)).toBe(false);

  // Unticking Primary returns the first to secondary, without affecting the other card
  await user.click(within(firstCard).getByRole('checkbox', { name: 'Primary' }));
  expect(within(firstCard).getByRole('checkbox', { name: 'Primary' })).not.toBeChecked();
  expect(within(secondCard).getByRole('checkbox', { name: 'Primary' })).not.toBeChecked();
});

test('shows the primary-required warning live and keeps saving blocked until a primary is ticked', async () => {
  const user = userEvent.setup();
  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);
  renderVisitNotesForm();

  // Nothing to warn about before any diagnosis is added
  expect(screen.queryByText(/choose at least one primary diagnosis/i)).not.toBeInTheDocument();

  // The warning appears as soon as diagnoses exist with none primary — before any save attempt
  const firstCard = await addDiagnosis(user, 'Diabetes Mellitus', { primary: false });
  expect(screen.getAllByText(/choose at least one primary diagnosis/i)).toHaveLength(1);
  const topCard = await addDiagnosis(user, 'Diabetes Mellitus, Type II', { primary: false });
  expect(screen.getAllByText(/choose at least one primary diagnosis/i)).toHaveLength(1);

  // Saving is still blocked; the failed save focuses the topmost card's Primary
  await user.click(screen.getByRole('button', { name: /save and close/i }));
  expect(within(topCard).getByRole('checkbox', { name: 'Primary' })).toHaveFocus();
  expect(mockSaveVisitNote).not.toHaveBeenCalled();

  // Ticking any primary clears it; unticking the last primary brings it straight back
  await user.click(within(firstCard).getByRole('checkbox', { name: 'Primary' }));
  await waitFor(() => expect(screen.queryByText(/choose at least one primary diagnosis/i)).not.toBeInTheDocument());
  await user.click(within(firstCard).getByRole('checkbox', { name: 'Primary' }));
  expect(await screen.findByText(/choose at least one primary diagnosis/i)).toBeInTheDocument();
});

test('lists primary diagnoses first and the newest of the rest on top', async () => {
  const user = userEvent.setup();
  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);
  renderVisitNotesForm();

  await addDiagnosis(user, 'Diabetes Mellitus');
  await addDiagnosis(user, 'Diabetes Mellitus, Type II');

  // Newest first while nothing is primary
  let [top, second] = screen.getAllByRole('group', { name: /diabetes mellitus/i });
  expect(top).toHaveAccessibleName('Diabetes Mellitus, Type II');
  expect(second).toHaveAccessibleName('Diabetes Mellitus');

  // Ticking Primary on the older one pins it to the top; the rest keep newest-first order
  await user.click(within(second).getByRole('checkbox', { name: 'Primary' }));
  [top, second] = screen.getAllByRole('group', { name: /diabetes mellitus/i });
  expect(top).toHaveAccessibleName('Diabetes Mellitus');
  expect(second).toHaveAccessibleName('Diabetes Mellitus, Type II');
});

test('tracks added and removed diagnoses as form changes and returns to clean when the draft is empty', async () => {
  const user = userEvent.setup();
  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);
  renderVisitNotesForm();
  const save = screen.getByRole('button', { name: /save and close/i });
  const isProtected = () => vi.mocked(Workspace2).mock.lastCall?.[0].hasUnsavedChanges;
  expect(save).toBeDisabled();
  expect(isProtected()).toBe(false);

  await addDiagnosis(user, 'Diabetes Mellitus');
  expect(save).toBeEnabled();
  expect(isProtected()).toBe(true);

  await user.click(screen.getByRole('button', { name: 'Remove Diabetes Mellitus' }));
  expect(save).toBeDisabled();
  expect(isProtected()).toBe(false);
  expect(screen.getByPlaceholderText('Search for a diagnosis')).toHaveFocus();
});

test('supports selecting a diagnosis search result with the keyboard', async () => {
  const user = userEvent.setup();

  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);

  renderVisitNotesForm();

  const searchBox = screen.getByPlaceholderText('Search for a diagnosis');
  await user.type(searchBox, 'Diabetes Mellitus');
  await screen.findByRole('button', { name: 'Diabetes Mellitus' });

  // ArrowDown moves focus from the input into the results list; Enter selects and
  // returns focus to the input
  await user.keyboard('{ArrowDown}');
  expect(screen.getByRole('button', { name: 'Diabetes Mellitus' })).toHaveFocus();
  await user.keyboard('{ArrowDown}');
  expect(screen.getByRole('button', { name: 'Diabetes Mellitus, Type II' })).toHaveFocus();
  await user.keyboard('{ArrowUp}');
  expect(screen.getByRole('button', { name: 'Diabetes Mellitus' })).toHaveFocus();
  await user.keyboard('{Enter}');

  expect(screen.getByRole('group', { name: 'Diabetes Mellitus' })).toBeInTheDocument();
  expect(searchBox).toHaveFocus();
});
