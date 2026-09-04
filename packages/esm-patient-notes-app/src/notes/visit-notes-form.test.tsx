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

/**
 * Searches for a diagnosis, adds it to the note, and (optionally) chooses its order and
 * certainty on the resulting diagnosis card. Order and certainty start unset by design.
 */
async function addDiagnosis(
  user: ReturnType<typeof userEvent.setup>,
  name: string,
  { order, certainty }: { order?: 'Primary' | 'Secondary'; certainty?: 'Confirmed' | 'Provisional' } = {},
) {
  const searchBox = screen.getByPlaceholderText('Choose a diagnosis');
  await user.clear(searchBox);
  await user.type(searchBox, name);
  await user.click(await screen.findByRole('menuitem', { name }));

  const card = screen.getByRole('group', { name });
  if (order) {
    await user.click(within(card).getByRole('radio', { name: order }));
  }
  if (certainty) {
    await user.click(within(card).getByRole('radio', { name: certainty }));
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

  expect(screen.getByRole('textbox', { name: /write your notes/i })).toBeInTheDocument();
  expect(screen.getByRole('searchbox', { name: /search for a diagnosis to add/i })).toBeInTheDocument();
  // The order/certainty helper text only appears once a diagnosis has been added
  expect(screen.queryByText(/choose order and certainty on each diagnosis selected/i)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /add image/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /discard/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /save and close/i })).toBeInTheDocument();
});

test('typing in the diagnosis search input triggers a search', async () => {
  const user = userEvent.setup();

  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);

  renderVisitNotesForm();

  const searchBox = screen.getByPlaceholderText('Choose a diagnosis');
  await user.type(searchBox, 'Diabetes Mellitus');

  // Wait for the search results to appear
  const targetSearchResult = await screen.findByRole('menuitem', { name: 'Diabetes Mellitus' });
  expect(targetSearchResult).toBeInTheDocument();
  expect(screen.getByRole('menuitem', { name: 'Diabetes Mellitus, Type II' })).toBeInTheDocument();

  // clicking on a search result displays the selected diagnosis as a card with unset order and certainty
  await user.click(targetSearchResult);
  const card = screen.getByRole('group', { name: 'Diabetes Mellitus' });
  // The test i18n mock interpolates but does not pluralize, so match the count only
  expect(screen.getByText(/1 diagnos/i)).toBeInTheDocument();
  expect(screen.getByText(/choose order and certainty on each diagnosis selected/i)).toBeInTheDocument();
  for (const radioName of ['Primary', 'Secondary', 'Confirmed', 'Provisional']) {
    expect(within(card).getByRole('radio', { name: radioName })).not.toBeChecked();
  }

  // choosing order and certainty reflects on the toggles
  await user.click(within(card).getByRole('radio', { name: 'Primary' }));
  await user.click(within(card).getByRole('radio', { name: 'Confirmed' }));
  expect(within(card).getByRole('radio', { name: 'Primary' })).toBeChecked();
  expect(within(card).getByRole('radio', { name: 'Confirmed' })).toBeChecked();

  // Clicking the remove button on the card removes the selected diagnosis
  await user.click(within(card).getByRole('button', { name: /remove diabetes mellitus/i }));
  // no selected diagnoses left
  expect(screen.getByText(/No diagnosis selected — Enter a diagnosis above/i)).toBeInTheDocument();
});

test('renders an error message when no matching diagnoses are found', async () => {
  const user = userEvent.setup();
  mockFetchDiagnosisConceptsByName.mockResolvedValue([]);

  renderVisitNotesForm();

  const searchBox = screen.getByPlaceholderText('Choose a diagnosis');
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

  expect(screen.getByText(/choose at least one primary diagnosis/i)).toBeInTheDocument();

  // Adding a diagnosis without choosing its order and certainty blocks submission,
  // with the error rendered inside the offending card
  const card = await addDiagnosis(user, 'Diabetes Mellitus');
  await user.click(submitButton);
  expect(within(card).getByText(/choose order and certainty for each diagnosis/i)).toBeInTheDocument();
  expect(mockSaveVisitNote).not.toHaveBeenCalled();

  // Completing the card clears its inline error without another submit
  await user.click(within(card).getByRole('radio', { name: 'Primary' }));
  await user.click(within(card).getByRole('radio', { name: 'Provisional' }));
  expect(within(card).queryByText(/choose order and certainty for each diagnosis/i)).not.toBeInTheDocument();

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
        certainty: 'PROVISIONAL',
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

  await addDiagnosis(user, 'Diabetes Mellitus', { order: 'Primary', certainty: 'Provisional' });

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

  await addDiagnosis(user, 'Diabetes Mellitus', { order: 'Primary', certainty: 'Provisional' });

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

  await addDiagnosis(user, 'Diabetes Mellitus', { order: 'Primary', certainty: 'Provisional' });

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

  await addDiagnosis(user, 'Diabetes Mellitus', { order: 'Primary', certainty: 'Provisional' });

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

  // Verify clinical note is pre-filled
  expect(screen.getByRole('textbox', { name: /write your notes/i })).toHaveValue('Existing clinical note');

  // Verify diagnosis is pre-filled with its stored order and certainty selected
  const card = screen.getByRole('group', { name: 'Diabetes Mellitus' });
  expect(within(card).getByRole('radio', { name: 'Primary' })).toBeChecked();
  expect(within(card).getByRole('radio', { name: 'Provisional' })).toBeChecked();
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

  const card = screen.getByRole('group', { name: 'Diabetes Mellitus' });
  expect(within(card).getByRole('radio', { name: 'Confirmed' })).toBeChecked();

  // Toggling certainty counts as an unsaved change (enabling Save), and toggling back
  // must still transmit the original CONFIRMED value
  await user.click(within(card).getByRole('radio', { name: 'Provisional' }));
  await user.click(within(card).getByRole('radio', { name: 'Confirmed' }));

  const submitButton = screen.getByRole('button', { name: /Save and close/i });
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

  // Reset mock for other tests
  mockUseConfig.mockReturnValue({
    ...getDefaultsFromConfigSchema(configSchema),
    ...ConfigMock,
  });
});

test('renders out-of-enum rank and certainty from other writers as unset and blocks saving until chosen', async () => {
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
        certainty: 'PRESUMED',
        rank: 0,
        display: 'Diabetes Mellitus',
      },
    ],
  };

  renderVisitNotesForm({
    formContext: 'editing',
    encounter: mockEncounter as unknown as Encounter,
  });

  const card = screen.getByRole('group', { name: 'Diabetes Mellitus' });
  for (const radioName of ['Primary', 'Secondary', 'Confirmed', 'Provisional']) {
    expect(within(card).getByRole('radio', { name: radioName })).not.toBeChecked();
  }

  // Removing a pre-loaded diagnosis counts as an unsaved change, enabling Save; here we
  // instead submit directly after touching the note so validation is exercised
  const clinicalNote = screen.getByRole('textbox', { name: /Write your notes/i });
  await user.type(clinicalNote, ' updated');
  await user.click(screen.getByRole('button', { name: /Save and close/i }));

  expect(within(card).getByText(/choose order and certainty for each diagnosis/i)).toBeInTheDocument();
  expect(mockUpdateVisitNote).not.toHaveBeenCalled();
});

test('shows the primary-required and incomplete-diagnosis errors together on a single submit', async () => {
  const user = userEvent.setup();

  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);

  renderVisitNotesForm();

  // A complete secondary diagnosis and an untouched one
  await addDiagnosis(user, 'Diabetes Mellitus', { order: 'Secondary', certainty: 'Confirmed' });
  const incompleteCard = await addDiagnosis(user, 'Diabetes Mellitus, Type II');

  await user.click(screen.getByRole('button', { name: /save and close/i }));

  // Both validation failures surface on the same submit: no two-stage whack-a-mole
  expect(screen.getByText(/choose at least one primary diagnosis/i)).toBeInTheDocument();
  expect(within(incompleteCard).getByText(/choose order and certainty for each diagnosis/i)).toBeInTheDocument();
  expect(mockSaveVisitNote).not.toHaveBeenCalled();
});

test('toggles order and certainty independently across multiple diagnosis cards', async () => {
  const user = userEvent.setup();

  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);

  renderVisitNotesForm();

  const firstCard = await addDiagnosis(user, 'Diabetes Mellitus');
  const secondCard = await addDiagnosis(user, 'Diabetes Mellitus, Type II');

  await user.click(within(firstCard).getByRole('radio', { name: 'Primary' }));
  await user.click(within(firstCard).getByRole('radio', { name: 'Confirmed' }));

  expect(within(firstCard).getByRole('radio', { name: 'Primary' })).toBeChecked();
  expect(within(firstCard).getByRole('radio', { name: 'Confirmed' })).toBeChecked();
  for (const radioName of ['Primary', 'Secondary', 'Confirmed', 'Provisional']) {
    expect(within(secondCard).getByRole('radio', { name: radioName })).not.toBeChecked();
  }

  // Switching a choice within a group deselects the other option
  await user.click(within(firstCard).getByRole('radio', { name: 'Secondary' }));
  expect(within(firstCard).getByRole('radio', { name: 'Primary' })).not.toBeChecked();
  expect(within(firstCard).getByRole('radio', { name: 'Secondary' })).toBeChecked();

  expect(screen.getByText(/2 diagnos/i)).toBeInTheDocument();
});
