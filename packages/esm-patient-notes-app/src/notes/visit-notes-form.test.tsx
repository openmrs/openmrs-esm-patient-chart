/**
 * @vitest-environment jsdom
 *
 * happy-dom's `AbortController` instances are not the host realm's
 * `AbortController`, so `toHaveBeenCalledWith(new AbortController(), ...)`
 * fails the cross-realm equality check used here.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { vi, expect, test, describe, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Button, Checkbox, OverflowMenuItem, type CheckboxProps } from '@carbon/react';
import { screen, render, waitFor, within, act, fireEvent } from '@testing-library/react';
import {
  type Encounter,
  type UploadedFile,
  createAttachment,
  ExtensionSlot,
  showModal,
  getDefaultsFromConfigSchema,
  OpenmrsDatePicker,
  showSnackbar,
  useConfig,
  usePatient,
  useSession,
  useFeatureFlag,
  Workspace2,
  type Visit,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import {
  type PatientWorkspace2DefinitionProps,
  type PatientWorkspaceGroupProps,
  useAllowedFileExtensions,
} from '@openmrs/esm-patient-common-lib';
import {
  deletePatientDiagnosis,
  fetchDiagnosisConceptsByName,
  removeVisitNoteImage,
  savePatientDiagnosis,
  saveVisitNote,
  updateVisitNote,
  useDiagnosisConceptClasses,
  useVisitNoteImages,
  useVisitNotes,
} from './visit-notes.resource';
import {
  ConfigMock,
  diagnosisSearchResponse,
  mockFetchLocationByUuidResponse,
  mockFetchProviderByUuidResponse,
  mockSessionDataResponse,
} from '__mocks__';
import { configSchema, type ConfigObject } from '../config-schema';
import enTranslations from '../../translations/en.json';
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
  return render(<VisitNotesFormWorkspace {...props} />);
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

/** A provisional row carries a visually hidden "Provisional" label beside its "?" */
function isMarkedProvisional(card: HTMLElement) {
  return within(card).queryByText('Provisional') !== null;
}

/**
 * Certainty is changed through the row's actions menu, not a checkbox. Carbon's floating menu
 * stays visibility: hidden until it is positioned, which empties the menu item's computed
 * accessible name in the test DOM, so the item is targeted by its text.
 */
async function setCertainty(user: ReturnType<typeof userEvent.setup>, card: HTMLElement, provisional: boolean) {
  await user.click(actionsMenuFor(card));
  await user.click(screen.getByText(provisional ? /mark as provisional/i : /mark as confirmed/i));
}

/**
 * Searches for a diagnosis, adds it to the note, and (optionally) sets the Primary checkbox
 * and the certainty of the resulting diagnosis card to a target state. By default Primary is
 * unticked (secondary) and certainty is confirmed.
 */
async function addDiagnosis(
  user: ReturnType<typeof userEvent.setup>,
  name: string,
  { primary, provisional }: { primary?: boolean; provisional?: boolean } = {},
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
  if (provisional != null && provisional !== isMarkedProvisional(card)) {
    await setCertainty(user, card, provisional);
  }
  return card;
}

const mockDeletePatientDiagnosis = vi.mocked(deletePatientDiagnosis);
const mockFetchDiagnosisConceptsByName = vi.mocked(fetchDiagnosisConceptsByName);
const mockSavePatientDiagnosis = vi.mocked(savePatientDiagnosis);
const mockSaveVisitNote = vi.mocked(saveVisitNote);
const mockShowSnackbar = vi.mocked(showSnackbar);
const mockUpdateVisitNote = vi.mocked(updateVisitNote);
const mockUseDiagnosisConceptClasses = vi.mocked(useDiagnosisConceptClasses);
const mockUseConfig = vi.mocked(useConfig<ConfigObject>);

const { diagnosisConceptClass } = getDefaultsFromConfigSchema(configSchema) as ConfigObject;
const symptomConceptClass = 'symptom-concept-class-uuid';
const mockUseSession = vi.mocked(useSession);
const mockedUseFeatureFlag = vi.mocked(useFeatureFlag);

vi.mock('lodash-es/debounce', () => vi.fn((fn) => fn));

vi.mock('@openmrs/esm-patient-common-lib', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@openmrs/esm-patient-common-lib');
  return {
    ...actual,
    useAllowedFileExtensions: vi.fn(() => ({ allowedFileExtensions: ['png'], error: undefined, isLoading: false })),
  };
});

vi.mock('./visit-notes.resource', () => ({
  deletePatientDiagnosis: vi.fn(),
  fetchDiagnosisConceptsByName: vi.fn(),
  savePatientDiagnosis: vi.fn(),
  removeVisitNoteImage: vi.fn(),
  updateVisitNote: vi.fn(),
  useLocationUuid: vi.fn().mockImplementation(() => ({
    data: mockFetchLocationByUuidResponse.data.uuid,
  })),
  useProviderUuid: vi.fn().mockImplementation(() => ({
    data: mockFetchProviderByUuidResponse.data.uuid,
  })),
  saveVisitNote: vi.fn(),
  useDiagnosisConceptClasses: vi.fn(),
  useVisitNoteImages: vi.fn(() => ({ images: [], isLoading: false, error: null })),
  useVisitNotes: vi.fn().mockImplementation(() => ({
    mutateVisitNotes: vi.fn(),
  })),
}));

mockUseSession.mockReturnValue(mockSessionDataResponse.data);
mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  ...ConfigMock,
});

type PatientState = ReturnType<typeof usePatient>;

const availablePatient: PatientState = {
  isLoading: false,
  patient: mockPatient,
  patientUuid: mockPatient.id,
  error: null,
};

beforeEach(() => {
  vi.mocked(usePatient).mockReturnValue(availablePatient);
  mockedUseFeatureFlag.mockReturnValue(false);
  // The edit-mode tests prefill concept '789' (Diabetes Mellitus); treat it as a true diagnosis
  mockUseDiagnosisConceptClasses.mockReturnValue({
    conceptClassByUuid: { '789': diagnosisConceptClass },
    error: undefined,
    isLoading: false,
  });
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
  // A primary diagnosis is required by default, so the field is marked required
  expect(screen.getByTitle('Required')).toBeInTheDocument();
  // The defaults helper text only appears once a diagnosis has been added
  expect(screen.queryByText(/diagnoses are recorded as confirmed unless marked provisional/i)).not.toBeInTheDocument();
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
  // default, so Primary starts unticked (secondary) and no provisional mark is shown
  await user.click(targetSearchResult);
  const card = screen.getByRole('group', { name: 'Diabetes Mellitus' });
  expect(screen.getByText(/diagnoses are recorded as confirmed unless marked provisional/i)).toBeInTheDocument();
  expect(within(card).getByRole('checkbox', { name: 'Primary' })).not.toBeChecked();
  expect(within(card).queryByRole('checkbox', { name: 'Confirmed' })).not.toBeInTheDocument();
  expect(isMarkedProvisional(card)).toBe(false);

  // Ticking Primary promotes it; the row's actions menu marks it provisional (a leading "?")
  await user.click(within(card).getByRole('checkbox', { name: 'Primary' }));
  await setCertainty(user, card, true);
  expect(within(card).getByRole('checkbox', { name: 'Primary' })).toBeChecked();
  expect(isMarkedProvisional(card)).toBe(true);
  expect(within(card).getByText('?')).toBeInTheDocument();

  // Clicking the remove button on the card removes the selected diagnosis
  await user.click(within(card).getByRole('button', { name: /remove diabetes mellitus/i }));
  // no selected diagnoses left, and no placeholder line takes their place
  expect(screen.queryByRole('group', { name: 'Diabetes Mellitus' })).not.toBeInTheDocument();
  expect(screen.queryByText(/no diagnosis selected/i)).not.toBeInTheDocument();
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

  // With nothing selected yet, the failed save reports the requirement as an error and focuses the search input
  expect(screen.getByText(/at least one diagnosis must be selected as primary/i)).toHaveAttribute('role', 'alert');
  expect(screen.getByText(/at least one diagnosis must be selected as primary/i)).toHaveClass('primaryRequiredError');
  expect(screen.getByPlaceholderText('Search for a diagnosis')).toHaveFocus();

  // A newly added diagnosis is never auto-ticked primary — the choice stays explicit
  const card = await addDiagnosis(user, 'Diabetes Mellitus');
  expect(within(card).getByRole('checkbox', { name: 'Primary' })).not.toBeChecked();

  // The requirement is already showing live (a diagnosis exists, none primary); submitting
  // keeps that single warning, leaves the Primary checkbox neutral and focuses it for the fix
  expect(screen.getAllByText(/at least one diagnosis must be selected as primary/i)).toHaveLength(1);
  await user.click(submitButton);
  expect(screen.getAllByText(/at least one diagnosis must be selected as primary/i)).toHaveLength(1);
  // ...and, now that a save has been blocked by it, the line is announced and styled as an error
  expect(screen.getByText(/at least one diagnosis must be selected as primary/i)).toHaveAttribute('role', 'alert');
  expect(screen.getByText(/at least one diagnosis must be selected as primary/i)).toHaveClass('primaryRequiredError');
  expect(within(card).getByRole('checkbox', { name: 'Primary' })).not.toHaveAttribute('data-invalid');
  expect(within(card).getByRole('checkbox', { name: 'Primary' })).toHaveFocus();
  expect(mockSaveVisitNote).not.toHaveBeenCalled();

  // Ticking Primary clears the error without another submit; certainty stays confirmed
  await user.click(within(card).getByRole('checkbox', { name: 'Primary' }));
  expect(screen.queryByText(/at least one diagnosis must be selected as primary/i)).not.toBeInTheDocument();

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
    uuid: '123',
    encounterDatetime: '2024-03-20T10:00:00.000Z',
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
  // Primary, and the stored PROVISIONAL shows the provisional mark
  const card = screen.getByRole('group', { name: 'Diabetes Mellitus' });
  expect(within(card).getByRole('checkbox', { name: 'Primary' })).toBeChecked();
  expect(isMarkedProvisional(card)).toBe(true);
});

test('updates existing visit note when in edit mode', async () => {
  const user = userEvent.setup();
  const mockEncounter = {
    uuid: '123',
    encounterDatetime: '2024-03-20T10:00:00.000Z',
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
    mockEncounter.uuid,
    expect.objectContaining(updatePayload),
  );
});

test('handles existing diagnoses correctly when in edit mode', async () => {
  const user = userEvent.setup();
  const mockEncounter = {
    uuid: '123',
    encounterDatetime: '2024-03-20T10:00:00.000Z',
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
  expect(screen.queryByRole('group', { name: 'Diabetes Mellitus' })).not.toBeInTheDocument();

  // Add new diagnosis
  await addDiagnosis(user, 'Diabetes Mellitus');

  // Verify new diagnosis is displayed
  expect(screen.getByRole('group', { name: 'Diabetes Mellitus' })).toBeInTheDocument();
});

test('preserves CONFIRMED certainty on diagnoses when re-saving a visit note in edit mode', async () => {
  const user = userEvent.setup();
  const mockEncounter = {
    uuid: '123',
    encounterDatetime: '2024-03-20T10:00:00.000Z',
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

  // A stored CONFIRMED diagnosis carries no provisional mark
  const card = screen.getByRole('group', { name: 'Diabetes Mellitus' });
  expect(isMarkedProvisional(card)).toBe(false);

  // Marking it provisional and then confirmed again leaves the diagnoses unchanged, so Save
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

test('preserves stored diagnosis ranks when only the clinical note is edited', async () => {
  const user = userEvent.setup();
  const encounter: Encounter = {
    ...existingNote,
    diagnoses: [
      {
        uuid: 'dx-1',
        display: 'Diabetes Mellitus',
        diagnosis: { coded: { uuid: '789', display: 'Diabetes Mellitus' } },
        certainty: 'CONFIRMED',
        rank: 1,
      },
      {
        uuid: 'dx-3',
        display: 'Anemia',
        diagnosis: { coded: { uuid: 'concept-3', display: 'Anemia' } },
        certainty: 'PROVISIONAL',
        rank: 3,
      },
    ],
  };
  mockUpdateVisitNote.mockResolvedValueOnce({ status: 200 } as Awaited<ReturnType<typeof updateVisitNote>>);

  renderVisitNotesForm({ formContext: 'editing', encounter });

  const primary = screen.getByRole('group', { name: 'Diabetes Mellitus' });
  const other = screen.getByRole('group', { name: 'Anemia' });
  expect(within(primary).getByRole('checkbox', { name: 'Primary' })).toBeChecked();
  expect(within(other).getByRole('checkbox', { name: 'Primary' })).not.toBeChecked();

  await user.type(screen.getByRole('textbox', { name: /write your notes/i }), ' (edited)');
  await user.click(screen.getByRole('button', { name: /save and close/i }));

  await waitFor(() => expect(mockSavePatientDiagnosis).toHaveBeenCalledTimes(2));
  expect(mockSavePatientDiagnosis).toHaveBeenCalledWith(
    expect.any(AbortController),
    expect.objectContaining({ diagnosis: { coded: '789' }, certainty: 'CONFIRMED', rank: 1 }),
  );
  expect(mockSavePatientDiagnosis).toHaveBeenCalledWith(
    expect.any(AbortController),
    expect.objectContaining({ diagnosis: { coded: 'concept-3' }, certainty: 'PROVISIONAL', rank: 3 }),
  );
});

test('leaves a stored diagnosis with neither a concept nor free text untouched when editing', async () => {
  const user = userEvent.setup();
  const encounter = {
    ...existingNote,
    diagnoses: [
      {
        uuid: 'dx-1',
        display: 'Diabetes Mellitus',
        diagnosis: { coded: { uuid: '789', display: 'Diabetes Mellitus' } },
        certainty: 'CONFIRMED',
        rank: 1,
      },
      { uuid: 'dx-empty', display: '', diagnosis: null, certainty: 'CONFIRMED', rank: 2 },
      { uuid: 'dx-blank', display: '', diagnosis: { coded: null, nonCoded: null }, certainty: 'CONFIRMED', rank: 2 },
    ],
  } as unknown as Encounter;
  mockUpdateVisitNote.mockResolvedValueOnce({ status: 200 } as Awaited<ReturnType<typeof updateVisitNote>>);

  renderVisitNotesForm({ formContext: 'editing', encounter });

  // Only the row the form can represent is shown
  expect(
    screen
      .getAllByRole('group')
      .filter((g) => g.getAttribute('aria-label'))
      .map((g) => g.getAttribute('aria-label')),
  ).toEqual(['Diabetes Mellitus']);

  await user.type(screen.getByRole('textbox', { name: /write your notes/i }), ' (edited)');
  await user.click(screen.getByRole('button', { name: /save and close/i }));

  // The empty rows are neither voided nor recreated
  await waitFor(() => expect(mockSavePatientDiagnosis).toHaveBeenCalledTimes(1));
  expect(mockDeletePatientDiagnosis).toHaveBeenCalledTimes(1);
  expect(mockDeletePatientDiagnosis).toHaveBeenCalledWith(expect.any(AbortController), 'dx-1');
  expect(mockSavePatientDiagnosis).toHaveBeenCalledWith(
    expect.any(AbortController),
    expect.objectContaining({ diagnosis: { coded: '789' }, certainty: 'CONFIRMED', rank: 1 }),
  );
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
  // With no primary requirement the diagnosis field is not marked required
  expect(screen.queryByTitle('Required')).not.toBeInTheDocument();

  const clinicalNote = screen.getByRole('textbox', { name: /Write your notes/i });
  await user.clear(clinicalNote);
  await user.type(clinicalNote, 'Clinical note without diagnosis');
  expect(clinicalNote).toHaveValue('Clinical note without diagnosis');

  const submitButton = screen.getByRole('button', { name: /Save and close/i });
  await user.click(submitButton);

  // Should not show validation error for missing primary diagnosis
  expect(screen.queryByText(/at least one diagnosis must be selected as primary/i)).not.toBeInTheDocument();

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
  expect(screen.getByText(/at least one diagnosis must be selected as primary/i)).toBeInTheDocument();

  // Should not attempt to save
  expect(mockSaveVisitNote).not.toHaveBeenCalled();

  // The requirement belongs to the diagnosis group: with several diagnoses and no primary,
  // the message renders once, both Primary checkboxes stay neutral, and the failed save
  // focuses the topmost (most recently added) card's Primary
  const firstCard = await addDiagnosis(user, 'Diabetes Mellitus', { primary: false });
  const topCard = await addDiagnosis(user, 'Diabetes Mellitus, Type II', { primary: false });
  await user.click(submitButton);

  expect(screen.getAllByText(/at least one diagnosis must be selected as primary/i)).toHaveLength(1);
  expect(screen.getByText(/at least one diagnosis must be selected as primary/i)).toHaveAttribute('role', 'alert');
  expect(screen.getByText(/at least one diagnosis must be selected as primary/i)).toHaveClass('primaryRequiredError');
  expect(within(firstCard).getByRole('checkbox', { name: 'Primary' })).not.toHaveAttribute('data-invalid');
  expect(within(topCard).getByRole('checkbox', { name: 'Primary' })).not.toHaveAttribute('data-invalid');
  expect(within(topCard).getByRole('checkbox', { name: 'Primary' })).toHaveFocus();
  expect(mockSaveVisitNote).not.toHaveBeenCalled();

  // Ticking any primary clears the group message without another submit
  await user.click(within(firstCard).getByRole('checkbox', { name: 'Primary' }));
  expect(screen.queryByText(/at least one diagnosis must be selected as primary/i)).not.toBeInTheDocument();

  // Reset mock for other tests
  mockUseConfig.mockReturnValue({
    ...getDefaultsFromConfigSchema(configSchema),
    ...ConfigMock,
  });
});

test.each(['result', 'outside', 'body'])(
  'allows continued typing after diagnosis results refresh when the user chooses %s',
  async (target) => {
    mockFetchDiagnosisConceptsByName.mockImplementation((query) =>
      query.endsWith('x') ? new Promise(() => {}) : Promise.resolve(diagnosisSearchResponse.results),
    );
    renderVisitNotesForm();
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Search for a diagnosis');
    await user.type(input, 'Diabetes');
    const result = await screen.findByRole('button', { name: 'Diabetes Mellitus' });
    await user.type(input, 'x');
    await user.keyboard('{ArrowDown}');
    expect(result).toHaveFocus();
    const outside = screen.getByRole('textbox', { name: /Write your notes/i });
    if (target === 'outside') await user.click(outside);
    if (target === 'body') await user.click(screen.getByText('Diagnosis', { exact: true }));
    await waitFor(() => expect(result).not.toBeInTheDocument());
    expect(target === 'outside' ? outside : target === 'body' ? document.body : input).toHaveFocus();
    await user.keyboard('yz');
    expect(input).toHaveValue(target === 'result' ? 'Diabetesxyz' : 'Diabetesx');
    expect(outside).toHaveValue(target === 'outside' ? 'yz' : '');
  },
);

test.each([false, true])(
  'tracks image-only edits and preserves other changes when removing the image (note edited: %s)',
  async (editNote) => {
    const user = userEvent.setup();
    const closeModal = vi.fn();
    vi.mocked(showModal).mockReturnValue(closeModal);
    const encounter: Encounter = {
      uuid: 'existing-note',
      id: 'existing-note',
      encounterDatetime: '2024-03-20T10:00:00.000Z',
      obs: [],
      diagnoses: [],
    };
    renderVisitNotesForm({ formContext: 'editing', encounter });

    const saveButton = screen.getByRole('button', { name: /save and close/i });
    expect(saveButton).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /add image/i }));
    const [, modalProps] = vi.mocked(showModal).mock.calls.find(([name]) => name === 'capture-photo-modal');
    const { saveFile } = modalProps as { saveFile: (file: UploadedFile) => Promise<void> };
    await act(async () => {
      await saveFile({
        fileName: 'visit-note.png',
        fileType: 'image/png',
        file: new File(['image'], 'visit-note.png', { type: 'image/png' }),
        base64Content: 'data:image/png;base64,aW1hZ2U=',
        fileDescription: 'Visit note image',
      });
    });

    expect(closeModal).toHaveBeenCalled();
    expect(screen.getByRole('img', { name: 'Visit note image' })).toBeInTheDocument();
    expect(saveButton).toBeEnabled();

    if (editNote) {
      await user.type(screen.getByRole('textbox', { name: /write your notes/i }), 'Updated note');
    }
    await user.click(screen.getByRole('button', { name: 'Remove image: Visit note image' }));

    expect(screen.queryByRole('img', { name: 'Visit note image' })).not.toBeInTheDocument();
    if (editNote) {
      expect(saveButton).toBeEnabled();
    } else {
      expect(saveButton).toBeDisabled();
    }
  },
);

test.each(['creating', 'editing'] as const)(
  'retains every image from a batch and subsequent uploads when %s',
  async (formContext) => {
    const user = userEvent.setup();
    vi.mocked(showModal).mockReturnValue(vi.fn());
    renderVisitNotesForm({
      formContext,
      ...(formContext === 'editing' && {
        encounter: {
          uuid: 'existing-note',
          id: 'existing-note',
          encounterDatetime: '2024-03-20T10:00:00.000Z',
          obs: [],
          diagnoses: [],
        },
      }),
    });
    const files: UploadedFile[] = ['red.png', 'blue.png', 'camera'].map((fileName) => ({
      fileName,
      fileType: 'image/png',
      fileDescription: fileName,
      base64Content: 'data:image/png;base64,aW1hZ2U=',
      capturedFromWebcam: fileName === 'camera',
    }));
    await user.click(screen.getByRole('button', { name: /add image/i }));
    const firstModal = vi.mocked(showModal).mock.lastCall[1] as { saveFile: (file: UploadedFile) => Promise<void> };
    await act(async () => {
      await Promise.all(files.slice(0, 2).map(firstModal.saveFile));
    });
    expect(screen.getByRole('img', { name: 'red.png' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'blue.png' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /add image/i }));
    const nextModal = vi.mocked(showModal).mock.lastCall[1] as { saveFile: (file: UploadedFile) => Promise<void> };
    await act(async () => {
      await nextModal.saveFile(files[2]);
    });
    expect(files[2].fileName).toBe('camera.png');
    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.getByRole('button', { name: /save and close/i })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Remove image: blue.png' }));
    expect(screen.queryByRole('img', { name: 'blue.png' })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'red.png' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'camera' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save and close/i })).toBeEnabled();
  },
);

test('labels image removal with the description, filename or image number', async () => {
  const user = userEvent.setup();
  vi.mocked(showModal).mockReturnValue(vi.fn());
  renderVisitNotesForm();
  await user.click(screen.getByRole('button', { name: /add image/i }));
  const modal = vi.mocked(showModal).mock.lastCall[1] as { saveFile: (file: UploadedFile) => Promise<void> };
  const files: UploadedFile[] = [
    { fileName: 'first.png', fileDescription: 'Front view' },
    { fileName: 'second.png', fileDescription: ' ' },
    { fileName: '', fileDescription: '' },
  ].map((file) => ({ ...file, fileType: 'image/png', base64Content: 'data:image/png;base64,aW1hZ2U=' }));

  await act(async () => {
    await Promise.all(files.map(modal.saveFile));
  });

  expect(screen.getByRole('button', { name: 'Remove image: Front view' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Remove image: second.png' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Remove image: 3' })).toBeInTheDocument();
});

const existingNote: Encounter = {
  uuid: 'existing-note',
  id: 'existing-note',
  encounterDatetime: '2024-03-20T10:00:00.000Z',
  obs: [{ concept: { uuid: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' }, value: 'Existing clinical note' }],
  diagnoses: [],
} as unknown as Encounter;

const newImage: UploadedFile = {
  fileName: 'wound.png',
  fileType: 'image/png',
  file: new File(['image'], 'wound.png', { type: 'image/png' }),
  base64Content: 'data:image/png;base64,aW1hZ2U=',
  fileDescription: 'Wound photo',
};

const defaultConfig: ConfigObject = { ...getDefaultsFromConfigSchema(configSchema), ...ConfigMock };
const noSavedImages = { images: [], isLoading: false, error: null };

afterEach(() => {
  mockUseConfig.mockReturnValue(defaultConfig);
  vi.mocked(useVisitNoteImages).mockReturnValue(noSavedImages);
  vi.mocked(useAllowedFileExtensions).mockReturnValue({
    allowedFileExtensions: ['png'],
    error: undefined,
    isLoading: false,
  });
});

// The image tests save notes without a diagnosis, so the config must not require one.
function allowNotesWithoutDiagnosis() {
  mockUseConfig.mockReturnValue({
    ...getDefaultsFromConfigSchema(configSchema),
    ...ConfigMock,
    isPrimaryDiagnosisRequired: false,
  });
}

async function addImage(user: ReturnType<typeof userEvent.setup>, file: UploadedFile) {
  await user.click(screen.getByRole('button', { name: /add image/i }));
  const modal = vi.mocked(showModal).mock.lastCall[1] as { saveFile: (file: UploadedFile) => Promise<void> };
  await act(async () => {
    await modal.saveFile(file);
  });
}

test('records images added while editing on the note encounter', async () => {
  const user = userEvent.setup();
  vi.mocked(showModal).mockReturnValue(vi.fn());
  allowNotesWithoutDiagnosis();
  mockUpdateVisitNote.mockResolvedValueOnce({ status: 200 } as unknown as Awaited<ReturnType<typeof updateVisitNote>>);
  renderVisitNotesForm({ formContext: 'editing', encounter: existingNote });

  await addImage(user, newImage);
  await user.click(screen.getByRole('button', { name: /save and close/i }));

  await waitFor(() => expect(createAttachment).toHaveBeenCalledTimes(1));
  expect(createAttachment).toHaveBeenCalledWith(
    mockPatient.id,
    expect.objectContaining({ fileName: 'wound.png', fileDescription: 'Wound photo' }),
    'existing-note',
  );
});

test('records images added to a new note on the encounter it just created', async () => {
  const user = userEvent.setup();
  vi.mocked(showModal).mockReturnValue(vi.fn());
  allowNotesWithoutDiagnosis();
  mockSaveVisitNote.mockResolvedValueOnce({ status: 201, data: { uuid: 'new-note' } } as unknown as Awaited<
    ReturnType<typeof saveVisitNote>
  >);
  renderVisitNotesForm();

  await addImage(user, newImage);
  await user.click(screen.getByRole('button', { name: /save and close/i }));

  await waitFor(() => expect(createAttachment).toHaveBeenCalledTimes(1));
  expect(createAttachment).toHaveBeenCalledWith(
    mockPatient.id,
    expect.objectContaining({ fileName: 'wound.png' }),
    'new-note',
  );
});

test('shows the images already saved on the note with remove controls and never re-uploads them', async () => {
  const user = userEvent.setup();
  vi.mocked(useVisitNoteImages).mockReturnValue({
    images: [
      {
        id: 'att-1',
        src: '/openmrs/ws/rest/v1/attachment/att-1/bytes',
        description: 'Front view',
        filename: 'front.png',
      },
      { id: 'att-2', src: '/openmrs/ws/rest/v1/attachment/att-2/bytes', description: '', filename: 'side.png' },
    ],
    isLoading: false,
    error: null,
  });
  allowNotesWithoutDiagnosis();
  mockUpdateVisitNote.mockResolvedValueOnce({ status: 200 } as unknown as Awaited<ReturnType<typeof updateVisitNote>>);
  renderVisitNotesForm({ formContext: 'editing', encounter: existingNote });

  expect(vi.mocked(useVisitNoteImages)).toHaveBeenCalledWith(mockPatient.id, 'existing-note');
  expect(screen.getByRole('img', { name: 'Front view' })).toHaveAttribute(
    'src',
    '/openmrs/ws/rest/v1/attachment/att-1/bytes',
  );
  expect(screen.getByRole('img', { name: 'side.png' })).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /remove image/i })).toHaveLength(2);
  await user.click(screen.getByRole('button', { name: /remove image: front view/i }));
  expect(removeVisitNoteImage).not.toHaveBeenCalled();
  expect(screen.getByText('Marked for removal')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /save and close/i })).toBeEnabled();
  await user.click(screen.getByRole('button', { name: /undo removal: front view/i }));
  expect(screen.getByRole('button', { name: /save and close/i })).toBeDisabled();

  await user.type(screen.getByRole('textbox', { name: /write your notes/i }), ' with more detail');
  await user.click(screen.getByRole('button', { name: /save and close/i }));

  await waitFor(() => expect(mockUpdateVisitNote).toHaveBeenCalledTimes(1));
  expect(createAttachment).not.toHaveBeenCalled();
});

test('does not request saved images while creating a note', () => {
  renderVisitNotesForm();
  expect(vi.mocked(useVisitNoteImages)).toHaveBeenCalledWith(mockPatient.id, undefined);
});

test('shows a loading indicator while the saved images load', () => {
  vi.mocked(useVisitNoteImages).mockReturnValue({ images: [], isLoading: true, error: null });
  renderVisitNotesForm({ formContext: 'editing', encounter: existingNote });
  expect(screen.getByText(/loading saved images/i)).toBeInTheDocument();
});

test('tells the user when the saved images could not be loaded', () => {
  vi.mocked(useVisitNoteImages).mockReturnValue({ images: [], isLoading: false, error: new Error('boom') });
  renderVisitNotesForm({ formContext: 'editing', encounter: existingNote });
  expect(screen.getByText(/couldn't load the images saved on this note/i)).toBeInTheDocument();
  expect(screen.queryByText(/loading saved images/i)).not.toBeInTheDocument();
});

test('saves the note and reports the images the server rejected instead of failing the whole save', async () => {
  const user = userEvent.setup();
  vi.mocked(showModal).mockReturnValue(vi.fn());
  allowNotesWithoutDiagnosis();
  mockSaveVisitNote.mockResolvedValueOnce({ status: 201, data: { uuid: 'new-note' } } as unknown as Awaited<
    ReturnType<typeof saveVisitNote>
  >);
  vi.mocked(createAttachment)
    .mockResolvedValueOnce({} as Awaited<ReturnType<typeof createAttachment>>)
    .mockRejectedValueOnce({ responseBody: { error: { message: 'The file content type text/plain is not allowed' } } });
  renderVisitNotesForm();

  await addImage(user, newImage);
  await addImage(user, { ...newImage, fileName: 'notes.png', fileDescription: 'Scanned notes' });
  await user.click(screen.getByRole('button', { name: /save and close/i }));

  await waitFor(() => expect(defaultProps.closeWorkspace).toHaveBeenCalled());
  expect(mockSaveVisitNote).toHaveBeenCalledTimes(1);
  expect(createAttachment).toHaveBeenCalledTimes(2);
  expect(mockShowSnackbar).toHaveBeenCalledWith(
    expect.objectContaining({
      kind: 'warning',
      title: 'Visit note saved, but 1 image was not uploaded',
      subtitle: 'Scanned notes: The file content type text/plain is not allowed Open the note to add it again.',
    }),
  );
  expect(mockShowSnackbar).not.toHaveBeenCalledWith(expect.objectContaining({ title: 'Error saving visit note' }));
});

test('still reports a failure to save the note itself as an error and keeps the form open', async () => {
  const user = userEvent.setup();
  allowNotesWithoutDiagnosis();
  mockSaveVisitNote.mockRejectedValueOnce({ responseBody: { error: { message: 'Encounter datetime is invalid' } } });
  renderVisitNotesForm();

  await user.type(screen.getByRole('textbox', { name: /write your notes/i }), 'Some note');
  await user.click(screen.getByRole('button', { name: /save and close/i }));

  await waitFor(() =>
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'error',
        title: 'Error saving visit note',
        subtitle: 'Encounter datetime is invalid',
      }),
    ),
  );
  expect(defaultProps.closeWorkspace).not.toHaveBeenCalled();
  expect(createAttachment).not.toHaveBeenCalled();
});

function setupSavedImages() {
  allowNotesWithoutDiagnosis();
  vi.mocked(useVisitNoteImages).mockReturnValue({
    images: [
      { id: 'att-1', src: '/front.png', filename: 'front.png' },
      { id: 'att-2', src: '/side.png', filename: 'side.png' },
    ],
    isLoading: false,
    error: null,
  });
  renderVisitNotesForm({ formContext: 'editing', encounter: existingNote });
}

test('discarding a staged image removal makes no delete request', async () => {
  const user = userEvent.setup();
  setupSavedImages();
  await user.click(screen.getByRole('button', { name: 'Remove image: front.png' }));
  await user.click(screen.getByRole('button', { name: 'Discard' }));
  expect(removeVisitNoteImage).not.toHaveBeenCalled();
  expect(defaultProps.closeWorkspace).toHaveBeenCalledWith();
});

test('saving only image removals does not rewrite the note or upload images', async () => {
  const user = userEvent.setup();
  setupSavedImages();
  await user.click(screen.getByRole('button', { name: 'Remove image: front.png' }));
  await user.click(screen.getByRole('button', { name: /save and close/i }));
  await waitFor(() => expect(defaultProps.closeWorkspace).toHaveBeenCalledWith({ discardUnsavedChanges: true }));
  expect(vi.mocked(removeVisitNoteImage).mock.calls.map(([imageId]) => imageId)).toEqual(['att-1']);
  expect(updateVisitNote).not.toHaveBeenCalled();
  expect(createAttachment).not.toHaveBeenCalled();
});

test('retries failed removals without repeating successful removals or saving the note early', async () => {
  const user = userEvent.setup();
  setupSavedImages();
  vi.mocked(removeVisitNoteImage).mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('Offline'));
  mockUpdateVisitNote.mockResolvedValueOnce({ status: 200 } as unknown as Awaited<ReturnType<typeof updateVisitNote>>);
  await user.type(screen.getByRole('textbox', { name: /write your notes/i }), ' updated');
  await user.click(screen.getByRole('button', { name: 'Remove image: front.png' }));
  await user.click(screen.getByRole('button', { name: 'Remove image: side.png' }));
  await user.click(screen.getByRole('button', { name: /save and close/i }));
  expect(await screen.findByText(/could not save all changes/i)).toBeInTheDocument();
  expect(defaultProps.closeWorkspace).not.toHaveBeenCalled();
  expect(updateVisitNote).not.toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: 'Undo removal: front.png' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /save and close/i }));
  await waitFor(() => expect(defaultProps.closeWorkspace).toHaveBeenCalledWith({ discardUnsavedChanges: true }));
  expect(vi.mocked(removeVisitNoteImage).mock.calls.map(([imageId]) => imageId)).toEqual(['att-1', 'att-2', 'att-2']);
  expect(updateVisitNote).toHaveBeenCalledTimes(1);
});

test('keeps visit-context header state stable while staging and undoing an image removal', async () => {
  const user = userEvent.setup();
  setupSavedImages();
  const headerStates = () =>
    vi
      .mocked(ExtensionSlot)
      .mock.calls.filter(([props]) => props.name === 'visit-context-header-slot')
      .map(([props]) => props.state);
  const initialState = headerStates()[0];
  expect(initialState).toEqual({ patientUuid: mockPatient.id });
  await user.click(screen.getByRole('button', { name: 'Remove image: front.png' }));
  await user.click(screen.getByRole('button', { name: 'Undo removal: front.png' }));
  expect(headerStates().length).toBeGreaterThan(1);
  expect(headerStates().every((state) => state === initialState)).toBe(true);
});

test('removing an image preserves saved diagnoses without rewriting the note', async () => {
  const user = userEvent.setup();
  vi.mocked(useVisitNoteImages).mockReturnValue({
    images: [{ id: 'att-1', src: '/front.png', filename: 'front.png' }],
    isLoading: false,
    error: null,
  });
  const noteWithDiagnoses = {
    ...existingNote,
    diagnoses: [
      {
        uuid: 'dx-1',
        display: 'Malaria',
        rank: 1,
        certainty: 'CONFIRMED',
        diagnosis: { coded: { uuid: 'concept-1' } },
      },
      {
        uuid: 'dx-2',
        display: 'Anemia',
        rank: 2,
        certainty: 'PROVISIONAL',
        diagnosis: { coded: { uuid: 'concept-2' } },
      },
    ],
  } as unknown as Encounter;
  renderVisitNotesForm({ formContext: 'editing', encounter: noteWithDiagnoses });
  await user.click(screen.getByRole('button', { name: 'Remove image: front.png' }));
  await user.click(screen.getByRole('button', { name: /save and close/i }));
  await waitFor(() => expect(defaultProps.closeWorkspace).toHaveBeenCalledWith({ discardUnsavedChanges: true }));
  expect(vi.mocked(removeVisitNoteImage).mock.calls.map(([imageId]) => imageId)).toEqual(['att-1']);
  expect(updateVisitNote).not.toHaveBeenCalled();
});

test.each([false, true])(
  'refreshes notes once after a batch of removals, including partial failure: %s',
  async (fails) => {
    const user = userEvent.setup();
    const refreshNotes = vi.fn();
    vi.mocked(useVisitNotes).mockReturnValue({
      mutateVisitNotes: refreshNotes,
      visitNotes: [],
      error: null,
      isLoading: false,
    });
    setupSavedImages();
    vi.mocked(removeVisitNoteImage).mockResolvedValueOnce(undefined);
    if (fails) vi.mocked(removeVisitNoteImage).mockRejectedValueOnce(new Error('Offline'));
    await user.click(screen.getByRole('button', { name: 'Remove image: front.png' }));
    await user.click(screen.getByRole('button', { name: 'Remove image: side.png' }));
    await user.click(screen.getByRole('button', { name: /save and close/i }));
    if (fails) await screen.findByText(/could not save all changes/i);
    else await waitFor(() => expect(defaultProps.closeWorkspace).toHaveBeenCalled());
    expect(refreshNotes).toHaveBeenCalledTimes(1);
  },
);
test('only offers image formats to the picker and stages files without an upload toast', async () => {
  const user = userEvent.setup();
  vi.mocked(useAllowedFileExtensions).mockReturnValue({
    allowedFileExtensions: ['jpeg', 'png', 'pdf', 'docx'],
    error: undefined,
    isLoading: false,
  });
  vi.mocked(showModal).mockReturnValue(vi.fn());
  renderVisitNotesForm();

  await user.click(screen.getByRole('button', { name: /add image/i }));

  expect(showModal).toHaveBeenCalledWith(
    'capture-photo-modal',
    expect.objectContaining({ allowedExtensions: ['jpeg', 'png'], showUploadSnackbar: false }),
  );
});

test('waits for the extension list before opening an image-only picker', async () => {
  const user = userEvent.setup();
  vi.mocked(useAllowedFileExtensions).mockReturnValue({
    allowedFileExtensions: undefined,
    error: undefined,
    isLoading: true,
  });
  vi.mocked(showModal).mockReturnValue(vi.fn());
  const { rerender } = renderVisitNotesForm();

  const addImage = screen.getByRole('button', { name: /add image/i });
  expect(addImage).toBeDisabled();
  await user.click(addImage);
  expect(showModal).not.toHaveBeenCalled();

  vi.mocked(useAllowedFileExtensions).mockReturnValue({
    allowedFileExtensions: ['png', 'pdf', 'docx'],
    error: undefined,
    isLoading: false,
  });
  rerender(<VisitNotesFormWorkspace {...defaultProps} />);

  expect(addImage).toBeEnabled();
  await user.click(addImage);
  expect(showModal).toHaveBeenCalledExactlyOnceWith(
    'capture-photo-modal',
    expect.objectContaining({ allowedExtensions: ['png'], showUploadSnackbar: false }),
  );
});

test.each([
  { allowedFileExtensions: undefined, error: new Error('Offline') },
  { allowedFileExtensions: ['png', 'pdf'], error: new Error('Offline') },
])('does not open the picker when restrictions are unavailable: %o', async (result) => {
  const user = userEvent.setup();
  vi.mocked(useAllowedFileExtensions).mockReturnValue({ ...result, isLoading: false });
  renderVisitNotesForm();

  const addImage = screen.getByRole('button', { name: /add image/i });
  expect(addImage).toBeDisabled();
  await user.click(addImage);
  expect(showModal).not.toHaveBeenCalled();
});

test.each([undefined, [], [''], ['  ']].map((allowedFileExtensions) => ({ allowedFileExtensions })))(
  'offers supported images when the backend has no extension restrictions: %j',
  async ({ allowedFileExtensions }) => {
    const user = userEvent.setup();
    vi.mocked(useAllowedFileExtensions).mockReturnValue({ allowedFileExtensions, error: undefined, isLoading: false });
    vi.mocked(showModal).mockReturnValue(vi.fn());
    renderVisitNotesForm();

    const addImage = screen.getByRole('button', { name: /add image/i });
    expect(addImage).toBeEnabled();
    await user.click(addImage);
    expect(showModal).toHaveBeenCalledWith(
      'capture-photo-modal',
      expect.objectContaining({ allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'] }),
    );
  },
);

test('disables image capture when the backend only allows documents', async () => {
  const user = userEvent.setup();
  vi.mocked(useAllowedFileExtensions).mockReturnValue({
    allowedFileExtensions: ['pdf', 'docx'],
    error: undefined,
    isLoading: false,
  });
  renderVisitNotesForm();

  const addImage = screen.getByRole('button', { name: /add image/i });
  expect(addImage).toBeDisabled();
  await user.click(addImage);
  expect(showModal).not.toHaveBeenCalled();
});

test('explains why image capture is disabled when loading restrictions fails', () => {
  vi.mocked(useAllowedFileExtensions).mockReturnValue({
    allowedFileExtensions: undefined,
    error: new Error('Offline'),
    isLoading: false,
  });
  renderVisitNotesForm();

  expect(screen.getByRole('button', { name: /add image/i })).toBeDisabled();
  expect(screen.getByText("Couldn't load the allowed image formats")).toBeInTheDocument();
  expect(screen.getByText('Reload the page to add images to this note.')).toBeInTheDocument();
});

test('keeps a saved image removal when a replacement upload fails and closes with a warning', async () => {
  const user = userEvent.setup();
  vi.mocked(showModal).mockReturnValue(vi.fn());
  setupSavedImages();
  mockUpdateVisitNote.mockResolvedValueOnce({ status: 200 } as Awaited<ReturnType<typeof updateVisitNote>>);
  vi.mocked(createAttachment).mockRejectedValueOnce(new Error('Upload rejected'));
  await user.click(screen.getByRole('button', { name: 'Remove image: front.png' }));
  await addImage(user, newImage);
  await user.click(screen.getByRole('button', { name: /save and close/i }));
  await waitFor(() => expect(defaultProps.closeWorkspace).toHaveBeenCalledWith({ discardUnsavedChanges: true }));
  expect(vi.mocked(removeVisitNoteImage).mock.calls.map(([imageId]) => imageId)).toEqual(['att-1']);
  expect(mockUpdateVisitNote).toHaveBeenCalledTimes(1);
  expect(createAttachment).toHaveBeenCalledTimes(1);
  expect(mockShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'warning' }));
  expect(mockShowSnackbar).not.toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }));
});

test('preserves rank zero and defaults an unrecognized certainty to confirmed', async () => {
  const user = userEvent.setup();

  mockUseConfig.mockReturnValue({
    ...getDefaultsFromConfigSchema(configSchema),
    ...ConfigMock,
    isPrimaryDiagnosisRequired: false,
  });

  const mockEncounter = {
    uuid: '123',
    encounterDatetime: '2024-03-20T10:00:00.000Z',
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

  // Rank zero leaves Primary unticked; an unrecognized certainty has no provisional mark.
  const card = screen.getByRole('group', { name: 'Diabetes Mellitus' });
  expect(within(card).getByRole('checkbox', { name: 'Primary' })).not.toBeChecked();
  expect(isMarkedProvisional(card)).toBe(false);

  // Saving preserves the stored rank and uses the default certainty.
  const clinicalNote = screen.getByRole('textbox', { name: /Write your notes/i });
  await user.type(clinicalNote, ' updated');
  await user.click(screen.getByRole('button', { name: /Save and close/i }));

  await waitFor(() =>
    expect(mockSavePatientDiagnosis).toHaveBeenCalledWith(
      expect.any(AbortController),
      expect.objectContaining({
        certainty: 'CONFIRMED',
        rank: 0,
        diagnosis: { coded: '789' },
      }),
    ),
  );

  mockUseConfig.mockReturnValue({
    ...getDefaultsFromConfigSchema(configSchema),
    ...ConfigMock,
  });
});

test('saves the confirmed default and records a diagnosis marked provisional as PROVISIONAL', async () => {
  const user = userEvent.setup();

  mockSaveVisitNote.mockResolvedValueOnce({
    status: 201,
    data: { uuid: 'new-encounter-uuid' },
  } as unknown as Awaited<ReturnType<typeof saveVisitNote>>);
  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);

  renderVisitNotesForm();

  // One primary diagnosis (confirmed by default), one secondary marked provisional
  await addDiagnosis(user, 'Diabetes Mellitus', { primary: true });
  await addDiagnosis(user, 'Diabetes Mellitus, Type II', { provisional: true });

  await user.type(screen.getByRole('textbox', { name: /Write your notes/i }), 'Sample clinical note');
  await user.click(screen.getByRole('button', { name: /save and close/i }));

  // The primary keeps the presumed confirmed certainty (no tick needed)
  await waitFor(() =>
    expect(mockSavePatientDiagnosis).toHaveBeenCalledWith(
      expect.any(AbortController),
      expect.objectContaining({ certainty: 'CONFIRMED', rank: 1 }),
    ),
  );
  // Marking the secondary provisional transmits the PROVISIONAL certainty
  expect(mockSavePatientDiagnosis).toHaveBeenCalledWith(
    expect.any(AbortController),
    expect.objectContaining({ certainty: 'PROVISIONAL', rank: 2 }),
  );
  expect(mockSavePatientDiagnosis).toHaveBeenCalledTimes(2);
});

test('marks Primary and provisional independently across multiple diagnosis cards', async () => {
  const user = userEvent.setup();

  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);

  renderVisitNotesForm();

  // Both cards start unticked and confirmed; changing one leaves the other alone
  const firstCard = await addDiagnosis(user, 'Diabetes Mellitus', { primary: true });
  const secondCard = await addDiagnosis(user, 'Diabetes Mellitus, Type II');

  // Marking the first card provisional through its actions menu does not touch the second
  await setCertainty(user, firstCard, true);

  expect(within(firstCard).getByRole('checkbox', { name: 'Primary' })).toBeChecked();
  expect(isMarkedProvisional(firstCard)).toBe(true);
  expect(within(secondCard).getByRole('checkbox', { name: 'Primary' })).not.toBeChecked();
  expect(isMarkedProvisional(secondCard)).toBe(false);

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
  expect(screen.queryByText(/at least one diagnosis must be selected as primary/i)).not.toBeInTheDocument();

  // The warning appears as soon as diagnoses exist with none primary — before any save attempt
  const firstCard = await addDiagnosis(user, 'Diabetes Mellitus', { primary: false });
  expect(screen.getAllByText(/at least one diagnosis must be selected as primary/i)).toHaveLength(1);
  const topCard = await addDiagnosis(user, 'Diabetes Mellitus, Type II', { primary: false });
  expect(screen.getAllByText(/at least one diagnosis must be selected as primary/i)).toHaveLength(1);

  // Saving is still blocked; the failed save focuses the topmost card's Primary
  await user.click(screen.getByRole('button', { name: /save and close/i }));
  expect(within(topCard).getByRole('checkbox', { name: 'Primary' })).toHaveFocus();
  expect(mockSaveVisitNote).not.toHaveBeenCalled();

  // Ticking any primary clears it; unticking the last primary brings it straight back
  await user.click(within(firstCard).getByRole('checkbox', { name: 'Primary' }));
  await waitFor(() =>
    expect(screen.queryByText(/at least one diagnosis must be selected as primary/i)).not.toBeInTheDocument(),
  );
  await user.click(within(firstCard).getByRole('checkbox', { name: 'Primary' }));
  expect(await screen.findByText(/at least one diagnosis must be selected as primary/i)).toBeInTheDocument();
});

test('keeps rows in place when Primary is toggled and lists new diagnoses on top', async () => {
  const user = userEvent.setup();
  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);
  renderVisitNotesForm();

  await addDiagnosis(user, 'Diabetes Mellitus');
  await addDiagnosis(user, 'Diabetes Mellitus, Type II');

  // Newest first
  const names = () =>
    screen.getAllByRole('group', { name: /diabetes mellitus/i }).map((g) => g.getAttribute('aria-label'));
  expect(names()).toEqual(['Diabetes Mellitus, Type II', 'Diabetes Mellitus']);

  // Ticking Primary on the lower row leaves it where it is, so the next click lands on the
  // row the user is looking at; switching primaries never reshuffles the list
  const [, lower] = screen.getAllByRole('group', { name: /diabetes mellitus/i });
  await user.click(within(lower).getByRole('checkbox', { name: 'Primary' }));
  expect(within(lower).getByRole('checkbox', { name: 'Primary' })).toBeChecked();
  expect(names()).toEqual(['Diabetes Mellitus, Type II', 'Diabetes Mellitus']);
  await user.click(within(lower).getByRole('checkbox', { name: 'Primary' }));
  expect(names()).toEqual(['Diabetes Mellitus, Type II', 'Diabetes Mellitus']);
});

test('sorts stored primaries first once when a note is opened for editing', () => {
  const encounter = {
    uuid: '123',
    encounterDatetime: '2024-03-20T10:00:00.000Z',
    diagnoses: [
      {
        uuid: '1',
        diagnosis: { coded: { uuid: '789', display: 'Cough' } },
        certainty: 'CONFIRMED',
        rank: 2,
        display: 'Cough',
      },
      {
        uuid: '2',
        diagnosis: { coded: { uuid: '789', display: 'Malaria' } },
        certainty: 'CONFIRMED',
        rank: 1,
        display: 'Malaria',
      },
      {
        uuid: '3',
        diagnosis: { coded: { uuid: '789', display: 'Fever' } },
        certainty: 'PROVISIONAL',
        rank: 2,
        display: 'Fever',
      },
    ],
  } as unknown as Encounter;

  renderVisitNotesForm({ formContext: 'editing', encounter });

  // Primary first, the rest in stored order — the same order the visits table shows
  expect(
    screen
      .getAllByRole('group')
      .filter((g) => g.getAttribute('aria-label'))
      .map((g) => g.getAttribute('aria-label')),
  ).toEqual(['Malaria', 'Cough', 'Fever']);
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

const mixedClassEncounter = {
  uuid: '123',
  encounterDatetime: '2024-03-20T10:00:00.000Z',
  diagnoses: [
    {
      uuid: '456',
      diagnosis: { coded: { uuid: '789', display: 'Diabetes Mellitus' } },
      certainty: 'CONFIRMED',
      rank: 1,
      display: 'Diabetes Mellitus',
    },
    {
      uuid: '457',
      diagnosis: { coded: { uuid: '790', display: 'Fever' } },
      certainty: 'PROVISIONAL',
      rank: 2,
      display: 'Fever',
    },
    {
      uuid: '458',
      diagnosis: { nonCoded: 'Possible dengue' },
      certainty: 'PROVISIONAL',
      rank: 2,
      display: 'Possible dengue',
    },
  ],
} as unknown as Encounter;

test('offers the certainty action only for diagnosis-class concepts when editing', async () => {
  const user = userEvent.setup();
  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);
  mockUseDiagnosisConceptClasses.mockReturnValue({
    conceptClassByUuid: { '789': diagnosisConceptClass, '790': symptomConceptClass },
    error: undefined,
    isLoading: false,
  });

  renderVisitNotesForm({ formContext: 'editing', encounter: mixedClassEncounter });

  // Only the coded concepts are looked up; free text has no concept class
  expect(mockUseDiagnosisConceptClasses).toHaveBeenLastCalledWith(['789', '790']);

  const diabetes = screen.getByRole('group', { name: 'Diabetes Mellitus' });
  const fever = screen.getByRole('group', { name: 'Fever' });
  const freeText = screen.getByRole('group', { name: 'Possible dengue' });
  expect(actionsMenuFor(diabetes)).toBeInTheDocument();
  // A symptom recorded as an encounter diagnosis by another form keeps its stored certainty
  // (the provisional mark still shows) but cannot have it changed here
  expect(within(fever).queryByRole('button', { name: /^actions for /i })).not.toBeInTheDocument();
  expect(isMarkedProvisional(fever)).toBe(true);
  // A free-text diagnosis is a diagnosis by the clinician's intent
  expect(actionsMenuFor(freeText)).toBeInTheDocument();

  // Concepts picked from the search are already of the diagnosis class: no extra lookup
  const added = await addDiagnosis(user, 'Diabetes Mellitus, Type II');
  expect(actionsMenuFor(added)).toBeInTheDocument();
  expect(mockUseDiagnosisConceptClasses).toHaveBeenLastCalledWith(['789', '790']);
});

test('withholds the certainty action for prefilled concepts until their class is known', () => {
  mockUseDiagnosisConceptClasses.mockReturnValue({ conceptClassByUuid: {}, error: undefined, isLoading: true });

  renderVisitNotesForm({ formContext: 'editing', encounter: mixedClassEncounter });

  expect(
    within(screen.getByRole('group', { name: 'Diabetes Mellitus' })).queryByRole('button', { name: /^actions for /i }),
  ).not.toBeInTheDocument();
  // Free text never needs the lookup
  expect(actionsMenuFor(screen.getByRole('group', { name: 'Possible dengue' }))).toBeInTheDocument();
});

test('keeps the certainty action for prefilled concepts when the class lookup fails', () => {
  mockUseDiagnosisConceptClasses.mockReturnValue({
    conceptClassByUuid: {},
    error: new Error('Internal Server Error'),
    isLoading: false,
  });

  renderVisitNotesForm({ formContext: 'editing', encounter: mixedClassEncounter });

  // Better to offer the action to a symptom than to strand a stored provisional diagnosis
  expect(actionsMenuFor(screen.getByRole('group', { name: 'Diabetes Mellitus' }))).toBeInTheDocument();
  expect(actionsMenuFor(screen.getByRole('group', { name: 'Fever' }))).toBeInTheDocument();
});

test('treats a concept the class lookup left out like a failed lookup', () => {
  // conceptreferences omits references it cannot resolve; the hook reports those as null
  mockUseDiagnosisConceptClasses.mockReturnValue({
    conceptClassByUuid: { '789': diagnosisConceptClass, '790': null },
    error: undefined,
    isLoading: false,
  });

  renderVisitNotesForm({ formContext: 'editing', encounter: mixedClassEncounter });

  expect(actionsMenuFor(screen.getByRole('group', { name: 'Diabetes Mellitus' }))).toBeInTheDocument();
  expect(actionsMenuFor(screen.getByRole('group', { name: 'Fever' }))).toBeInTheDocument();
});

test('describes every Primary checkbox with the primary-required message while it is shown', async () => {
  const user = userEvent.setup();
  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);
  renderVisitNotesForm();

  const card = await addDiagnosis(user, 'Diabetes Mellitus');
  const checkbox = within(card).getByRole('checkbox', { name: 'Primary' });
  expect(checkbox).toHaveAttribute('aria-describedby', 'primary-diagnosis-requirement');
  expect(checkbox).toHaveAccessibleDescription(/at least one diagnosis must be selected as primary/i);

  // Once a primary exists the message unmounts and the reference points at nothing
  await user.click(checkbox);
  expect(checkbox).not.toHaveAccessibleDescription();
});

describe('when the patient record becomes unavailable while the form is open', () => {
  const otherPatient = { ...mockPatient, id: 'other-patient-uuid' };
  const missingPatient: PatientState = {
    isLoading: false,
    patient: null,
    patientUuid: mockPatient.id,
    error: null,
  };
  const blockedPatientStates: Array<[string, PatientState]> = [
    ['is still loading', { isLoading: true, patient: null, patientUuid: mockPatient.id, error: null }],
    [
      'failed to load while a cached patient is still present',
      { isLoading: false, patient: mockPatient, patientUuid: mockPatient.id, error: new Error('Patient not found') },
    ],
    [
      'failed to load',
      { isLoading: false, patient: null, patientUuid: mockPatient.id, error: new Error('Patient not found') },
    ],
    ['settled with no patient', missingPatient],
    [
      'returned a different hook UUID while the cached opening patient is still present',
      { isLoading: false, patient: mockPatient, patientUuid: otherPatient.id, error: null },
    ],
    [
      'switched to a different patient',
      { isLoading: false, patient: otherPatient, patientUuid: otherPatient.id, error: null },
    ],
    [
      'returned a patient other than the one the form was opened for',
      { isLoading: false, patient: otherPatient, patientUuid: mockPatient.id, error: null },
    ],
  ];

  const createdNote = { status: 201, data: { uuid: 'new-note' } } as unknown as Awaited<
    ReturnType<typeof saveVisitNote>
  >;

  function deferred<T>() {
    let resolve: (value: T) => void;
    let reject: (reason: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  }

  const flush = () =>
    act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

  function renderOwnedForm({
    exported = false,
    workspaceProps = {},
  }: { exported?: boolean; workspaceProps?: Partial<VisitNotesFormWorkspaceProps> } = {}) {
    const element = (launcherPatientUuid: string) =>
      exported ? (
        <ExportedVisitNotesFormWorkspace
          {...defaultProps}
          groupProps={{}}
          workspaceProps={{
            formContext: 'creating',
            patient: mockPatient,
            patientUuid: launcherPatientUuid,
            visitContext: null,
            ...workspaceProps,
          }}
        />
      ) : (
        <VisitNotesFormWorkspace
          {...defaultProps}
          workspaceProps={{ ...defaultProps.workspaceProps, ...workspaceProps }}
          groupProps={{ ...defaultProps.groupProps, patientUuid: launcherPatientUuid }}
        />
      );
    const view = render(element(mockPatient.id));
    return {
      setPatient(state: PatientState, launcherPatientUuid = mockPatient.id) {
        vi.mocked(usePatient).mockReturnValue(state);
        view.rerender(element(launcherPatientUuid));
      },
    };
  }

  function expectPausedForUnavailablePatient() {
    expect(screen.getByText(/patient record unavailable/i)).toBeInTheDocument();
    expect(screen.getAllByText(/your draft is retained/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /save and close/i })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: /write your notes/i })).toBeDisabled();
    expect(screen.getByRole('searchbox', { name: /search for a diagnosis to add/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /add image/i })).toBeDisabled();
  }

  function expectNoCompletion() {
    expect(defaultProps.closeWorkspace).not.toHaveBeenCalled();
    expect(mockShowSnackbar).not.toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.stringMatching(/^visit note saved/i) }),
    );
  }

  beforeEach(() => {
    vi.mocked(showModal).mockReturnValue(vi.fn());
    mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);
  });

  // R2
  test('reads the live patient record for the patient the form was opened for', () => {
    renderOwnedForm();

    expect(usePatient).toHaveBeenCalledWith(mockPatient.id);
    expect(screen.queryByText(/patient record unavailable/i)).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /write your notes/i })).toBeEnabled();
  });

  // R2, R3
  test.each(blockedPatientStates)('pauses editing and saving when the patient record %s', async (_, state) => {
    const user = userEvent.setup();
    const { setPatient } = renderOwnedForm();
    await user.type(screen.getByRole('textbox', { name: /write your notes/i }), 'Draft note');

    setPatient(state);

    expectPausedForUnavailablePatient();
    expect(screen.getByRole('textbox', { name: /write your notes/i })).toHaveValue('Draft note');
  });

  // R2
  test('stays paused when the launcher follows a different patient while the draft is open', async () => {
    const user = userEvent.setup();
    const { setPatient } = renderOwnedForm();
    await user.type(screen.getByRole('textbox', { name: /write your notes/i }), 'Draft note');

    setPatient({ isLoading: false, patient: otherPatient, patientUuid: otherPatient.id, error: null }, otherPatient.id);

    expectPausedForUnavailablePatient();
  });

  // R3
  test('translates the unavailable and draft-retained notification with keys defined in en.json', () => {
    const translate = vi.spyOn(useTranslation(), 't');
    try {
      const { setPatient } = renderOwnedForm();
      setPatient(missingPatient);

      const translations = translate.mock.calls as unknown as Array<[string, unknown]>;
      for (const shownText of [/patient record unavailable/i, /your draft is retained/i]) {
        const translation = translations.find(([, defaultValue]) => shownText.test(String(defaultValue)));
        expect(translation, `no translation renders ${shownText}`).toBeDefined();
        const [key, defaultValue] = translation;
        expect(enTranslations).toHaveProperty([key], defaultValue);
      }
    } finally {
      translate.mockRestore();
    }
  });

  // R1, R8
  test.each([false, true])(
    'keeps the same form, note, diagnoses, staged images and unsaved status through unavailability and recovery (exported: %s)',
    async (exported) => {
      const user = userEvent.setup();
      const { setPatient } = renderOwnedForm({ exported });
      const note = screen.getByRole('textbox', { name: /write your notes/i });
      await user.type(note, 'Draft note');
      const availableCard = await addDiagnosis(user, 'Diabetes Mellitus', { primary: true });
      expect(actionsMenuFor(availableCard)).toBeEnabled();
      await addImage(user, newImage);

      setPatient(missingPatient);

      expectPausedForUnavailablePatient();
      expect(screen.getByRole('textbox', { name: /write your notes/i })).toBe(note);
      expect(note).toHaveValue('Draft note');
      const card = screen.getByRole('group', { name: 'Diabetes Mellitus' });
      expect(within(card).getByRole('checkbox', { name: 'Primary' })).toBeChecked();
      expect(within(card).getByRole('checkbox', { name: 'Primary' })).toBeDisabled();
      expect(within(card).getByRole('button', { name: /remove diabetes mellitus/i })).toBeDisabled();
      expect(actionsMenuFor(card)).toBeDisabled();
      expect(screen.getByRole('img', { name: 'Wound photo' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove image: Wound photo' })).toBeDisabled();
      expect(vi.mocked(Workspace2).mock.lastCall?.[0].hasUnsavedChanges).toBe(true);
      expect(defaultProps.closeWorkspace).not.toHaveBeenCalled();

      setPatient(availablePatient);

      expect(screen.queryByText(/patient record unavailable/i)).not.toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /write your notes/i })).toBe(note);
      expect(note).toBeEnabled();
      expect(note).toHaveValue('Draft note');
      const recoveredCard = screen.getByRole('group', { name: 'Diabetes Mellitus' });
      expect(within(recoveredCard).getByRole('checkbox', { name: 'Primary' })).toBeChecked();
      expect(within(recoveredCard).getByRole('checkbox', { name: 'Primary' })).toBeEnabled();
      expect(actionsMenuFor(recoveredCard)).toBeEnabled();
      expect(screen.getByRole('img', { name: 'Wound photo' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove image: Wound photo' })).toBeEnabled();
      expect(vi.mocked(Workspace2).mock.lastCall?.[0].hasUnsavedChanges).toBe(true);
      expect(screen.getByRole('button', { name: /save and close/i })).toBeEnabled();
      expect(defaultProps.closeWorkspace).not.toHaveBeenCalled();
    },
  );

  // R4
  test('ignores a native form submission while paused', async () => {
    const user = userEvent.setup();
    allowNotesWithoutDiagnosis();
    mockSaveVisitNote.mockResolvedValue(createdNote);
    const { setPatient } = renderOwnedForm();
    const note = screen.getByRole('textbox', { name: /write your notes/i });
    await user.type(note, 'Draft note');

    setPatient(missingPatient);
    fireEvent.submit(note);
    await flush();

    expect(mockSaveVisitNote).not.toHaveBeenCalled();
    expect(mockSavePatientDiagnosis).not.toHaveBeenCalled();
    expect(createAttachment).not.toHaveBeenCalled();
    expectNoCompletion();
    // The submit event bypasses the disabled Save button, so only the submit handler can refuse it
    expect(screen.getByRole('button', { name: /save and close/i })).toBeDisabled();
  });

  // R3/R4: retain the DOM interaction checks. Captured public callbacks below independently
  // exercise escaped handlers without depending on dispatch to disabled or detached elements.
  test('the note handler refuses a change delivered while paused', async () => {
    const user = userEvent.setup();
    const { setPatient } = renderOwnedForm();
    const note = screen.getByRole('textbox', { name: /write your notes/i });
    await user.type(note, 'Draft note');

    setPatient(missingPatient);
    fireEvent.change(note, { target: { value: 'Changed while paused' } });

    expect(note).toHaveValue('Draft note');
    expect(note).toBeDisabled();
  });

  // R4
  test('the diagnosis search handler refuses a query delivered while paused', () => {
    const { setPatient } = renderOwnedForm();
    const searchBox = screen.getByRole('searchbox', { name: /search for a diagnosis to add/i });

    setPatient(missingPatient);
    fireEvent.change(searchBox, { target: { value: 'Diabetes' } });

    expect(searchBox).toHaveValue('');
    expect(mockFetchDiagnosisConceptsByName).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Diabetes Mellitus' })).not.toBeInTheDocument();
    expect(searchBox).toBeDisabled();
  });

  // R4
  test('the Primary handler refuses a toggle delivered while paused', async () => {
    const user = userEvent.setup();
    const { setPatient } = renderOwnedForm();
    const card = await addDiagnosis(user, 'Diabetes Mellitus');
    const primary = within(card).getByRole('checkbox', { name: 'Primary' });

    setPatient(missingPatient);
    fireEvent.click(primary);

    expect(
      within(screen.getByRole('group', { name: 'Diabetes Mellitus' })).getByRole('checkbox', { name: 'Primary' }),
    ).not.toBeChecked();
    expect(primary).toBeDisabled();
  });

  // R4
  test('ignores a diagnosis result, Primary toggle or removal clicked after the patient became unavailable', async () => {
    const user = userEvent.setup();
    const { setPatient } = renderOwnedForm();
    const card = await addDiagnosis(user, 'Diabetes Mellitus');
    await user.type(screen.getByPlaceholderText('Search for a diagnosis'), 'Diabetes');
    const openResult = await screen.findByRole('button', { name: 'Diabetes Mellitus, Type II' });
    const primary = within(card).getByRole('checkbox', { name: 'Primary' });
    const remove = within(card).getByRole('button', { name: /remove diabetes mellitus/i });

    setPatient(missingPatient);
    fireEvent.click(openResult);
    fireEvent.click(primary);
    fireEvent.click(remove);

    expect(screen.queryByRole('group', { name: 'Diabetes Mellitus, Type II' })).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('group', { name: 'Diabetes Mellitus' })).getByRole('checkbox', { name: 'Primary' }),
    ).not.toBeChecked();
  });

  // R4
  test('ignores a certainty change chosen from an actions menu opened before the patient became unavailable', async () => {
    const user = userEvent.setup();
    const { setPatient } = renderOwnedForm();
    const card = await addDiagnosis(user, 'Diabetes Mellitus');
    await user.click(actionsMenuFor(card));
    const markProvisional = screen.getByText(/mark as provisional/i);

    setPatient(missingPatient);
    fireEvent.click(markProvisional);

    expect(isMarkedProvisional(screen.getByRole('group', { name: 'Diabetes Mellitus' }))).toBe(false);
  });

  // R4
  test('ignores an image staged from a photo dialog opened before the patient became unavailable', async () => {
    const user = userEvent.setup();
    const { setPatient } = renderOwnedForm();
    await user.click(screen.getByRole('button', { name: /add image/i }));
    const modal = vi.mocked(showModal).mock.lastCall[1] as { saveFile: (file: UploadedFile) => Promise<void> };

    setPatient(missingPatient);
    await act(async () => {
      await modal.saveFile(newImage).catch(() => {});
    });

    expect(screen.queryByRole('img', { name: 'Wound photo' })).not.toBeInTheDocument();
  });

  // R4
  test('ignores a date picked after the patient became unavailable', () => {
    mockedUseFeatureFlag.mockReturnValue(true);
    const { setPatient } = renderOwnedForm();
    const dateInput = screen.getByLabelText(/visit date/i);
    const dateBefore = (dateInput as HTMLInputElement).value;

    setPatient(missingPatient);
    expect(vi.mocked(OpenmrsDatePicker).mock.lastCall?.[0].isDisabled).toBe(true);
    // The framework mock's input ignores isDisabled, so this reaches the onChange handler itself
    expect(dateInput).toBeEnabled();
    fireEvent.change(dateInput, { target: { value: '2024-01-15' } });

    expect(dateInput).toHaveValue(dateBefore);
  });

  // R4
  test('ignores image removal and undo while paused', async () => {
    const user = userEvent.setup();
    allowNotesWithoutDiagnosis();
    vi.mocked(useVisitNoteImages).mockReturnValue({
      images: [
        { id: 'att-1', src: '/front.png', filename: 'front.png' },
        { id: 'att-2', src: '/side.png', filename: 'side.png' },
      ],
      isLoading: false,
      error: null,
    });
    const { setPatient } = renderOwnedForm({ workspaceProps: { formContext: 'editing', encounter: existingNote } });
    await user.click(screen.getByRole('button', { name: 'Remove image: front.png' }));
    await addImage(user, newImage);

    setPatient(missingPatient);
    expect(screen.getByRole('button', { name: 'Undo removal: front.png' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remove image: side.png' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Undo removal: front.png' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove image: side.png' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove image: Wound photo' }));

    expect(screen.getAllByText('Marked for removal')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Undo removal: front.png' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Wound photo' })).toBeInTheDocument();
  });

  // Record only public props at React's classic JSX factory, forwarding every element unchanged.
  // Real Carbon controls remain mounted for the existing integration and disabled-state assertions.
  function observeEditCallbacks() {
    const clicks = new Map<string, React.MouseEventHandler<HTMLButtonElement>>();
    const primaryChanges = new Map<string, CheckboxProps['onChange']>();
    const certaintyChanges = new Map<string, React.MouseEventHandler<HTMLElement>>();
    const createElement = React.createElement;
    const observer = vi.spyOn(React, 'createElement').mockImplementation((type, props, ...children) => {
      if (type === Button || (type === 'button' && children[0] === 'Diabetes Mellitus, Type II')) {
        const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement> & { iconDescription?: string };
        const name = buttonProps?.['aria-label'] ?? buttonProps?.iconDescription ?? children[0];
        if (typeof name === 'string' && buttonProps?.onClick) {
          clicks.set(name, buttonProps.onClick);
        }
      } else if (type === Checkbox) {
        const checkboxProps = props as CheckboxProps;
        primaryChanges.set(checkboxProps.id, checkboxProps.onChange);
      } else if (type === OverflowMenuItem) {
        const itemProps = props as React.ComponentProps<typeof OverflowMenuItem>;
        if (typeof itemProps.itemText === 'string') {
          certaintyChanges.set(itemProps.itemText, itemProps.onClick);
        }
      }
      return createElement(type, props, ...children);
    });
    return { clicks, primaryChanges, certaintyChanges, restore: () => observer.mockRestore() };
  }

  const escapedEdits = [
    'diagnosis result',
    'diagnosis removal',
    'diagnosis certainty',
    'Primary',
    'stored-image removal',
    'stored-image undo',
    'staged-image removal',
    'date selection',
  ] as const;

  async function prepareEscapedEdit(edit: (typeof escapedEdits)[number]) {
    const user = userEvent.setup();
    const callbacks = observeEditCallbacks();
    let invoke: () => void | Promise<unknown>;
    let expectChanged: (changed: boolean) => void;
    let setPatient: ReturnType<typeof renderOwnedForm>['setPatient'];
    const click = (name: string) => {
      const callback = callbacks.clicks.get(name);
      expect(callback).toEqual(expect.any(Function));
      return () => callback({} as React.MouseEvent<HTMLButtonElement>);
    };
    try {
      if (edit === 'diagnosis result') {
        ({ setPatient } = renderOwnedForm());
        await user.type(screen.getByPlaceholderText('Search for a diagnosis'), 'Diabetes');
        await screen.findByRole('button', { name: 'Diabetes Mellitus, Type II' });
        invoke = click('Diabetes Mellitus, Type II');
        expectChanged = (changed) => {
          expect(screen.queryByRole('group', { name: 'Diabetes Mellitus, Type II' }) !== null).toBe(changed);
          expect(screen.getByPlaceholderText('Search for a diagnosis')).toHaveValue(changed ? '' : 'Diabetes');
        };
      } else if (edit === 'diagnosis removal' || edit === 'diagnosis certainty' || edit === 'Primary') {
        ({ setPatient } = renderOwnedForm());
        const card = await addDiagnosis(user, 'Diabetes Mellitus');
        if (edit === 'diagnosis removal') {
          invoke = click('Remove Diabetes Mellitus');
          expectChanged = (changed) =>
            expect(screen.queryByRole('group', { name: 'Diabetes Mellitus' }) === null).toBe(changed);
        } else if (edit === 'Primary') {
          const primary = within(card).getByRole('checkbox', { name: 'Primary' });
          const callback = callbacks.primaryChanges.get(primary.id);
          expect(callback).toEqual(expect.any(Function));
          invoke = () => callback({} as React.ChangeEvent<HTMLInputElement>, { checked: true, id: primary.id });
          expectChanged = (changed) => {
            if (changed) {
              expect(
                within(screen.getByRole('group', { name: 'Diabetes Mellitus' })).getByRole('checkbox', {
                  name: 'Primary',
                }),
              ).toBeChecked();
            } else {
              expect(
                within(screen.getByRole('group', { name: 'Diabetes Mellitus' })).getByRole('checkbox', {
                  name: 'Primary',
                }),
              ).not.toBeChecked();
            }
          };
        } else {
          await user.click(actionsMenuFor(card));
          const callback = callbacks.certaintyChanges.get('Mark as provisional');
          expect(callback).toEqual(expect.any(Function));
          invoke = () => callback({} as React.MouseEvent<HTMLElement>);
          expectChanged = (changed) =>
            expect(isMarkedProvisional(screen.getByRole('group', { name: 'Diabetes Mellitus' }))).toBe(changed);
        }
      } else if (edit === 'stored-image removal' || edit === 'stored-image undo') {
        vi.mocked(useVisitNoteImages).mockReturnValue({
          images: [{ id: 'att-1', src: '/front.png', filename: 'front.png' }],
          isLoading: false,
          error: null,
        });
        ({ setPatient } = renderOwnedForm({ workspaceProps: { formContext: 'editing', encounter: existingNote } }));
        if (edit === 'stored-image undo') {
          await user.click(screen.getByRole('button', { name: 'Remove image: front.png' }));
        }
        invoke = click(edit === 'stored-image undo' ? 'Undo removal: front.png' : 'Remove image: front.png');
        expectChanged = (changed) => {
          const removed = edit === 'stored-image undo' ? !changed : changed;
          expect(screen.queryByText('Marked for removal') !== null).toBe(removed);
          expect(
            screen.getByRole('button', { name: removed ? 'Undo removal: front.png' : 'Remove image: front.png' }),
          ).toBeInTheDocument();
          expect(screen.getByRole('img', { name: 'front.png' })).toBeInTheDocument();
        };
      } else if (edit === 'staged-image removal') {
        ({ setPatient } = renderOwnedForm());
        await addImage(user, newImage);
        invoke = click('Remove image: Wound photo');
        expectChanged = (changed) => expect(screen.queryByRole('img', { name: 'Wound photo' }) === null).toBe(changed);
      } else {
        mockedUseFeatureFlag.mockReturnValue(true);
        ({ setPatient } = renderOwnedForm());
        const dateInput = screen.getByLabelText(/visit date/i) as HTMLInputElement;
        const initialDate = dateInput.value;
        const callback = vi.mocked(OpenmrsDatePicker).mock.lastCall[0].onChange;
        expect(callback).toEqual(expect.any(Function));
        invoke = () => callback(new Date('2024-01-15T12:00:00Z'));
        expectChanged = (changed) =>
          expect(screen.getByLabelText(/visit date/i)).toHaveValue(changed ? '15/01/2024' : initialDate);
      }
      expectChanged(false);
      // Freeze the available-state references before the blocked rerender can replace any handler.
      return { invoke, expectChanged, setPatient };
    } finally {
      callbacks.restore();
    }
  }

  // R4 positive controls: each exact public callback path must perform its intended edit while available.
  test.each(escapedEdits)('the captured %s callback edits the available draft', async (edit) => {
    const { invoke, expectChanged } = await prepareEscapedEdit(edit);

    await act(async () => {
      await invoke();
    });

    expectChanged(true);
  });

  // R4: call the same captured function after invalidation; no DOM event dispatch can suppress it.
  test.each(escapedEdits)('ignores the captured %s callback after the patient becomes unavailable', async (edit) => {
    const { invoke, expectChanged, setPatient } = await prepareEscapedEdit(edit);

    setPatient(missingPatient);
    const snackbarCountBeforeCallback = mockShowSnackbar.mock.calls.length;
    await act(async () => {
      await invoke();
    });

    expectChanged(false);
    if (edit === 'staged-image removal') {
      const callbackNotifications = mockShowSnackbar.mock.calls
        .slice(snackbarCountBeforeCallback)
        .map(([notification]) => notification);
      expect(callbackNotifications).not.toContainEqual(expect.objectContaining({ title: 'Image removed' }));
    }
    expect(mockSaveVisitNote).not.toHaveBeenCalled();
    expect(mockUpdateVisitNote).not.toHaveBeenCalled();
    expect(mockDeletePatientDiagnosis).not.toHaveBeenCalled();
    expect(mockSavePatientDiagnosis).not.toHaveBeenCalled();
    expect(removeVisitNoteImage).not.toHaveBeenCalled();
    expect(createAttachment).not.toHaveBeenCalled();
    expectNoCompletion();
  });

  // R5, R6, R8
  test('aborts a pending note save and starts no later step when its response arrives after unavailability', async () => {
    const user = userEvent.setup();
    const pendingSave = deferred<Awaited<ReturnType<typeof saveVisitNote>>>();
    mockSaveVisitNote.mockReturnValueOnce(pendingSave.promise as ReturnType<typeof saveVisitNote>);
    const { setPatient } = renderOwnedForm();
    await addDiagnosis(user, 'Diabetes Mellitus', { primary: true });
    await addImage(user, newImage);
    await user.type(screen.getByRole('textbox', { name: /write your notes/i }), 'Draft note');
    await user.click(screen.getByRole('button', { name: /save and close/i }));
    await waitFor(() => expect(mockSaveVisitNote).toHaveBeenCalledTimes(1));
    const [controller] = mockSaveVisitNote.mock.calls[0];

    setPatient(missingPatient);
    expect(controller.signal.aborted).toBe(true);
    await act(async () => pendingSave.resolve(createdNote));
    await flush();

    expect(mockSavePatientDiagnosis).not.toHaveBeenCalled();
    expect(createAttachment).not.toHaveBeenCalled();
    expectNoCompletion();
    expect(await screen.findByText(/some changes may already be saved/i)).toBeInTheDocument();
    expect(screen.getAllByText(/your draft is retained/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('textbox', { name: /write your notes/i })).toHaveValue('Draft note');

    setPatient(availablePatient);
    await flush();

    expect(screen.getByRole('textbox', { name: /write your notes/i })).toBeEnabled();
    expect(screen.getByRole('textbox', { name: /write your notes/i })).toHaveValue('Draft note');
    expect(screen.getByRole('group', { name: 'Diabetes Mellitus' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Wound photo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save and close/i })).toBeEnabled();
    expect(mockSavePatientDiagnosis).not.toHaveBeenCalled();
    expect(createAttachment).not.toHaveBeenCalled();
    expectNoCompletion();
  });

  // R5, R6
  test('aborts a pending note update and removes or saves no diagnosis when it resolves after unavailability', async () => {
    const user = userEvent.setup();
    const storedNote = {
      uuid: 'stored-note',
      encounterDatetime: '2024-03-20T10:00:00.000Z',
      obs: [],
      diagnoses: [
        {
          uuid: 'stored-dx',
          diagnosis: { coded: { uuid: '789', display: 'Diabetes Mellitus' } },
          certainty: 'CONFIRMED',
          rank: 1,
          display: 'Diabetes Mellitus',
        },
      ],
    } as unknown as Encounter;
    const pendingUpdate = deferred<Awaited<ReturnType<typeof updateVisitNote>>>();
    mockUpdateVisitNote.mockReturnValueOnce(pendingUpdate.promise as ReturnType<typeof updateVisitNote>);
    const { setPatient } = renderOwnedForm({ workspaceProps: { formContext: 'editing', encounter: storedNote } });
    await user.type(screen.getByRole('textbox', { name: /write your notes/i }), 'Updated note');
    await user.click(screen.getByRole('button', { name: /save and close/i }));
    await waitFor(() => expect(mockUpdateVisitNote).toHaveBeenCalledTimes(1));
    const [controller] = mockUpdateVisitNote.mock.calls[0];

    setPatient(missingPatient);
    expect(controller.signal.aborted).toBe(true);
    await act(async () => pendingUpdate.resolve({ status: 200 } as Awaited<ReturnType<typeof updateVisitNote>>));
    await flush();

    expect(mockDeletePatientDiagnosis).not.toHaveBeenCalled();
    expect(mockSavePatientDiagnosis).not.toHaveBeenCalled();
    expectNoCompletion();
    expect(await screen.findByText(/some changes may already be saved/i)).toBeInTheDocument();
  });

  // R5, R6
  test('aborts a pending removal of stored diagnoses and saves no diagnosis when it resolves after unavailability', async () => {
    const user = userEvent.setup();
    const storedNote = {
      uuid: 'stored-note',
      encounterDatetime: '2024-03-20T10:00:00.000Z',
      obs: [],
      diagnoses: [
        {
          uuid: 'stored-dx',
          diagnosis: { coded: { uuid: '789', display: 'Diabetes Mellitus' } },
          certainty: 'CONFIRMED',
          rank: 1,
          display: 'Diabetes Mellitus',
        },
      ],
    } as unknown as Encounter;
    mockUpdateVisitNote.mockResolvedValueOnce({ status: 200 } as Awaited<ReturnType<typeof updateVisitNote>>);
    const pendingDelete = deferred<Awaited<ReturnType<typeof deletePatientDiagnosis>>>();
    mockDeletePatientDiagnosis.mockReturnValueOnce(pendingDelete.promise as ReturnType<typeof deletePatientDiagnosis>);
    const { setPatient } = renderOwnedForm({ workspaceProps: { formContext: 'editing', encounter: storedNote } });
    await user.type(screen.getByRole('textbox', { name: /write your notes/i }), 'Updated note');
    await user.click(screen.getByRole('button', { name: /save and close/i }));
    await waitFor(() => expect(mockDeletePatientDiagnosis).toHaveBeenCalledTimes(1));
    const [controller] = mockDeletePatientDiagnosis.mock.calls[0];

    setPatient(missingPatient);
    expect(controller.signal.aborted).toBe(true);
    await act(async () => pendingDelete.resolve(undefined));
    await flush();

    expect(mockSavePatientDiagnosis).not.toHaveBeenCalled();
    expectNoCompletion();
  });

  // R5, R6
  test('aborts a pending diagnosis save and starts no image upload when it resolves after unavailability', async () => {
    const user = userEvent.setup();
    mockSaveVisitNote.mockResolvedValueOnce(createdNote);
    const pendingDiagnosis = deferred<Awaited<ReturnType<typeof savePatientDiagnosis>>>();
    mockSavePatientDiagnosis.mockReturnValueOnce(pendingDiagnosis.promise as ReturnType<typeof savePatientDiagnosis>);
    const { setPatient } = renderOwnedForm();
    await addDiagnosis(user, 'Diabetes Mellitus', { primary: true });
    await addImage(user, newImage);
    await user.click(screen.getByRole('button', { name: /save and close/i }));
    await waitFor(() => expect(mockSavePatientDiagnosis).toHaveBeenCalledTimes(1));
    const [controller] = mockSavePatientDiagnosis.mock.calls[0];

    setPatient(missingPatient);
    expect(controller.signal.aborted).toBe(true);
    await act(async () => pendingDiagnosis.resolve(undefined));
    await flush();

    expect(createAttachment).not.toHaveBeenCalled();
    expectNoCompletion();
  });

  // R5, R6
  test('aborts a pending image deletion and starts neither another deletion nor a note save', async () => {
    const user = userEvent.setup();
    allowNotesWithoutDiagnosis();
    vi.mocked(useVisitNoteImages).mockReturnValue({
      images: [
        { id: 'att-1', src: '/front.png', filename: 'front.png' },
        { id: 'att-2', src: '/side.png', filename: 'side.png' },
      ],
      isLoading: false,
      error: null,
    });
    const pendingRemoval = deferred<Awaited<ReturnType<typeof removeVisitNoteImage>>>();
    vi.mocked(removeVisitNoteImage).mockReturnValueOnce(
      pendingRemoval.promise as ReturnType<typeof removeVisitNoteImage>,
    );
    const { setPatient } = renderOwnedForm({ workspaceProps: { formContext: 'editing', encounter: existingNote } });
    await user.type(screen.getByRole('textbox', { name: /write your notes/i }), ' updated');
    await user.click(screen.getByRole('button', { name: 'Remove image: front.png' }));
    await user.click(screen.getByRole('button', { name: 'Remove image: side.png' }));
    await user.click(screen.getByRole('button', { name: /save and close/i }));
    await waitFor(() => expect(removeVisitNoteImage).toHaveBeenCalledTimes(1));
    const signal = vi.mocked(removeVisitNoteImage).mock.calls[0][1] as AbortSignal | undefined;

    setPatient(missingPatient);
    expect(signal?.aborted).toBe(true);
    await act(async () => pendingRemoval.resolve(undefined));
    await flush();

    expect(removeVisitNoteImage).toHaveBeenCalledTimes(1);
    expect(mockUpdateVisitNote).not.toHaveBeenCalled();
    expectNoCompletion();
  });

  // R5, R6: the final deletion is a separate boundary from the next-deletion case above.
  test('aborts the final pending image deletion and starts no encounter update for a dirty note', async () => {
    const user = userEvent.setup();
    allowNotesWithoutDiagnosis();
    mockUpdateVisitNote.mockResolvedValueOnce({ status: 200 } as Awaited<ReturnType<typeof updateVisitNote>>);
    vi.mocked(useVisitNoteImages).mockReturnValue({
      images: [{ id: 'att-1', src: '/front.png', filename: 'front.png' }],
      isLoading: false,
      error: null,
    });
    const pendingRemoval = deferred<Awaited<ReturnType<typeof removeVisitNoteImage>>>();
    vi.mocked(removeVisitNoteImage).mockReturnValueOnce(
      pendingRemoval.promise as ReturnType<typeof removeVisitNoteImage>,
    );
    const { setPatient } = renderOwnedForm({ workspaceProps: { formContext: 'editing', encounter: existingNote } });
    const note = screen.getByRole('textbox', { name: /write your notes/i });
    await user.type(note, ' updated');
    expect(note).toHaveValue('Existing clinical note updated');
    await addImage(user, newImage);
    await user.click(screen.getByRole('button', { name: 'Remove image: front.png' }));
    await user.click(screen.getByRole('button', { name: /save and close/i }));
    await waitFor(() => expect(removeVisitNoteImage).toHaveBeenCalledTimes(1));
    expect(mockUpdateVisitNote).not.toHaveBeenCalled();
    const signal = vi.mocked(removeVisitNoteImage).mock.calls[0][1] as AbortSignal | undefined;

    setPatient(missingPatient);
    await act(async () => pendingRemoval.resolve(undefined));
    await flush();

    expect(mockUpdateVisitNote).not.toHaveBeenCalled();
    expect(mockSaveVisitNote).not.toHaveBeenCalled();
    expect(mockDeletePatientDiagnosis).not.toHaveBeenCalled();
    expect(mockSavePatientDiagnosis).not.toHaveBeenCalled();
    expect(createAttachment).not.toHaveBeenCalled();
    expect(removeVisitNoteImage).toHaveBeenCalledTimes(1);
    expect(signal?.aborted).toBe(true);
    expectNoCompletion();
  });

  // R7
  test('does not resume an interrupted save when the same patient recovers, and a new save then completes', async () => {
    const user = userEvent.setup();
    const pendingSave = deferred<Awaited<ReturnType<typeof saveVisitNote>>>();
    mockSaveVisitNote.mockReturnValueOnce(pendingSave.promise as ReturnType<typeof saveVisitNote>);
    const { setPatient } = renderOwnedForm();
    await addDiagnosis(user, 'Diabetes Mellitus', { primary: true });
    await user.click(screen.getByRole('button', { name: /save and close/i }));
    await waitFor(() => expect(mockSaveVisitNote).toHaveBeenCalledTimes(1));

    setPatient(missingPatient);
    setPatient(availablePatient);
    await act(async () => pendingSave.resolve(createdNote));
    await flush();

    expect(mockSavePatientDiagnosis).not.toHaveBeenCalled();
    expectNoCompletion();

    mockSaveVisitNote.mockResolvedValueOnce({ status: 201, data: { uuid: 'second-note' } } as unknown as Awaited<
      ReturnType<typeof saveVisitNote>
    >);
    await user.click(screen.getByRole('button', { name: /save and close/i }));

    await waitFor(() => expect(defaultProps.closeWorkspace).toHaveBeenCalledWith({ discardUnsavedChanges: true }));
    expect(mockSaveVisitNote).toHaveBeenCalledTimes(2);
    expect(mockSavePatientDiagnosis).toHaveBeenCalledExactlyOnceWith(
      expect.any(AbortController),
      expect.objectContaining({ encounter: 'second-note' }),
    );
  });

  // R7
  test.each([false, true])(
    'late image upload results cannot complete an interrupted save (upload fails: %s)',
    async (uploadFails) => {
      const user = userEvent.setup();
      allowNotesWithoutDiagnosis();
      mockSaveVisitNote.mockResolvedValueOnce(createdNote);
      const pendingUpload = deferred<Awaited<ReturnType<typeof createAttachment>>>();
      vi.mocked(createAttachment).mockReturnValueOnce(pendingUpload.promise as ReturnType<typeof createAttachment>);
      const { setPatient } = renderOwnedForm();
      await addImage(user, newImage);
      await user.click(screen.getByRole('button', { name: /save and close/i }));
      await waitFor(() => expect(createAttachment).toHaveBeenCalledTimes(1));

      setPatient(missingPatient);
      await act(async () =>
        uploadFails ? pendingUpload.reject(new Error('Upload rejected')) : pendingUpload.resolve(undefined),
      );
      await flush();

      expectNoCompletion();
      expect(await screen.findByText(/some changes may already be saved/i)).toBeInTheDocument();
    },
  );

  // R7, R8: current availability alone cannot authorize completion of a canceled attempt.
  test.each([false, true])(
    'same-owner recovery before a late image upload settles still requires a new save (upload fails: %s)',
    async (uploadFails) => {
      const user = userEvent.setup();
      allowNotesWithoutDiagnosis();
      mockSaveVisitNote.mockResolvedValueOnce(createdNote);
      const pendingUpload = deferred<Awaited<ReturnType<typeof createAttachment>>>();
      vi.mocked(createAttachment).mockReturnValueOnce(pendingUpload.promise as ReturnType<typeof createAttachment>);
      const { setPatient } = renderOwnedForm();
      const note = screen.getByRole('textbox', { name: /write your notes/i });
      await user.type(note, 'Retained upload draft');
      await addImage(user, newImage);
      await user.click(screen.getByRole('button', { name: /save and close/i }));
      await waitFor(() => expect(createAttachment).toHaveBeenCalledTimes(1));

      setPatient(missingPatient);
      setPatient(availablePatient);
      await act(async () =>
        uploadFails ? pendingUpload.reject(new Error('Upload rejected')) : pendingUpload.resolve(undefined),
      );
      await flush();

      expectNoCompletion();
      expect(await screen.findByText(/some changes may already be saved/i)).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /write your notes/i })).toBe(note);
      expect(note).toHaveValue('Retained upload draft');
      expect(note).toBeEnabled();
      expect(screen.getByRole('img', { name: 'Wound photo' })).toBeInTheDocument();
      expect(vi.mocked(Workspace2).mock.lastCall?.[0].hasUnsavedChanges).toBe(true);
      expect(mockSaveVisitNote).toHaveBeenCalledTimes(1);
      expect(createAttachment).toHaveBeenCalledTimes(1);
      expect(mockSavePatientDiagnosis).not.toHaveBeenCalled();
      const save = screen.getByRole('button', { name: /save and close/i });
      expect(save).toBeEnabled();

      // A later user save is allowed; encounter reuse after partial persistence is deliberately unspecified.
      mockSaveVisitNote.mockResolvedValueOnce(createdNote);
      mockUpdateVisitNote.mockResolvedValueOnce({ status: 200 } as Awaited<ReturnType<typeof updateVisitNote>>);
      vi.mocked(createAttachment).mockResolvedValueOnce(undefined);
      await user.click(save);

      await waitFor(() =>
        expect(defaultProps.closeWorkspace).toHaveBeenCalledExactlyOnceWith({ discardUnsavedChanges: true }),
      );
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'success', title: 'Visit note saved' }),
      );
    },
  );

  // R9
  test.each([false, true])(
    'saves and closes normally while the patient stays available (exported: %s)',
    async (exported) => {
      const user = userEvent.setup();
      mockSaveVisitNote.mockResolvedValueOnce(createdNote);
      renderOwnedForm({ exported });
      await addDiagnosis(user, 'Diabetes Mellitus', { primary: true });
      await addImage(user, newImage);
      await user.type(screen.getByRole('textbox', { name: /write your notes/i }), 'Draft note');
      await user.click(screen.getByRole('button', { name: /save and close/i }));

      await waitFor(() => expect(defaultProps.closeWorkspace).toHaveBeenCalledWith({ discardUnsavedChanges: true }));
      expect(mockSaveVisitNote).toHaveBeenCalledTimes(1);
      expect(mockSavePatientDiagnosis).toHaveBeenCalledExactlyOnceWith(
        expect.any(AbortController),
        expect.objectContaining({ encounter: 'new-note' }),
      );
      expect(createAttachment).toHaveBeenCalledExactlyOnceWith(
        mockPatient.id,
        expect.objectContaining({ fileName: 'wound.png' }),
        'new-note',
      );
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'success', title: 'Visit note saved' }),
      );
    },
  );
});
