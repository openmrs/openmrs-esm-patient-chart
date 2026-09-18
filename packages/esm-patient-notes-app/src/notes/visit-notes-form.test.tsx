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
import { screen, render, waitFor, act } from '@testing-library/react';
import {
  type Encounter,
  type UploadedFile,
  createAttachment,
  showModal,
  getDefaultsFromConfigSchema,
  showSnackbar,
  useConfig,
  useSession,
  useLayoutType,
  useFeatureFlag,
  type Visit,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import {
  type PatientWorkspace2DefinitionProps,
  type PatientWorkspaceGroupProps,
} from '@openmrs/esm-patient-common-lib';
import {
  fetchDiagnosisConceptsByName,
  saveVisitNote,
  updateVisitNote,
  useVisitNoteImages,
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

const mockFetchDiagnosisConceptsByName = vi.mocked(fetchDiagnosisConceptsByName);
const mockSaveVisitNote = vi.mocked(saveVisitNote);
const mockShowSnackbar = vi.mocked(showSnackbar);
const mockUpdateVisitNote = vi.mocked(updateVisitNote);
const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseSession = vi.mocked(useSession);
const mockedUseFeatureFlag = vi.mocked(useFeatureFlag);

vi.mock('lodash-es/debounce', () => vi.fn((fn) => fn));

vi.mock('./visit-notes.resource', () => ({
  fetchDiagnosisConceptsByName: vi.fn(),
  updateVisitNote: vi.fn(),
  useLocationUuid: vi.fn().mockImplementation(() => ({
    data: mockFetchLocationByUuidResponse.data.uuid,
  })),
  useProviderUuid: vi.fn().mockImplementation(() => ({
    data: mockFetchProviderByUuidResponse.data.uuid,
  })),
  saveVisitNote: vi.fn(),
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

beforeEach(() => {
  mockedUseFeatureFlag.mockReturnValue(false);
  vi.mocked(useLayoutType).mockReturnValue('small-desktop');
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
  expect(screen.getByRole('searchbox', { name: /enter primary diagnoses/i })).toBeInTheDocument();
  expect(screen.getByRole('searchbox', { name: /enter secondary diagnoses/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /add image/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /discard/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /save and close/i })).toBeInTheDocument();
});

test('typing in the diagnosis search input triggers a search', async () => {
  const user = userEvent.setup();

  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);

  renderVisitNotesForm();

  const searchBox = screen.getByPlaceholderText('Choose a primary diagnosis');
  await user.type(searchBox, 'Diabetes Mellitus');

  // Wait for the search results to appear
  const targetSearchResult = await screen.findByRole('button', { name: 'Diabetes Mellitus' });
  expect(targetSearchResult).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Diabetes Mellitus, Type II' })).toBeInTheDocument();

  // clicking on a search result displays the selected diagnosis as a tag
  await user.click(targetSearchResult);
  expect(screen.getByTitle('Diabetes Mellitus')).toBeInTheDocument();
  const diabetesMellitusTag = screen.getByTitle(/^Diabetes Mellitus$/i);
  expect(diabetesMellitusTag).toBeInTheDocument();

  const closeTagButton = screen.getByRole('button', { name: /clear filter/i });
  // Clicking the close button on the tag removes the selected diagnosis
  await user.click(closeTagButton);
  // no selected diagnoses left
  expect(screen.getByText(/No diagnosis selected — Enter a diagnosis below/i)).toBeInTheDocument();
});

test.each(['primary', 'secondary'])('selects a %s diagnosis using only the keyboard', async (rank) => {
  const user = userEvent.setup();
  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);
  renderVisitNotesForm();

  const search = screen.getByPlaceholderText(`Choose a ${rank} diagnosis`);
  await user.type(search, 'Diabetes');
  const first = await screen.findByRole('button', { name: 'Diabetes Mellitus' });
  const second = screen.getByRole('button', { name: 'Diabetes Mellitus, Type II' });

  await user.keyboard('{ArrowDown}');
  expect(first).toHaveFocus();
  await user.keyboard('{ArrowDown}');
  expect(second).toHaveFocus();
  await user.keyboard('{ArrowUp}');
  expect(first).toHaveFocus();
  await user.keyboard('{End}');
  expect(second).toHaveFocus();
  await user.keyboard('{Home}');
  expect(first).toHaveFocus();
  await user.keyboard('{Escape}');
  expect(search).toHaveFocus();
  expect(screen.getByText(/No diagnosis selected/)).toBeInTheDocument();

  await user.keyboard('{ArrowUp}');
  expect(second).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(screen.getByTitle('Diabetes Mellitus, Type II')).toBeInTheDocument();
  expect(search).toHaveFocus();
  expect(search).toHaveValue('');

  await user.type(search, 'Diabetes');
  await screen.findByRole('button', { name: 'Diabetes Mellitus' });
  expect(screen.queryByRole('button', { name: 'Diabetes Mellitus, Type II' })).not.toBeInTheDocument();
  await user.keyboard('{ArrowDown}{Enter}');
  expect(screen.getByTitle('Diabetes Mellitus')).toBeInTheDocument();
});

test.each(['small-desktop', 'tablet'] as const)('uses creation wording on %s', (layout) => {
  vi.mocked(useLayoutType).mockReturnValue(layout);
  renderVisitNotesForm();
  expect(screen.getAllByText('Add visit note', { exact: true })).toHaveLength(layout === 'tablet' ? 2 : 1);
  expect(screen.queryByText('Edit visit note')).not.toBeInTheDocument();
  if (layout === 'tablet') {
    expect(screen.getByRole('heading', { name: 'Add visit note', level: 2 })).toBeInTheDocument();
  }
});

test('renders an error message when no matching diagnoses are found', async () => {
  const user = userEvent.setup();
  mockFetchDiagnosisConceptsByName.mockResolvedValue([]);

  renderVisitNotesForm();

  const searchBox = screen.getByPlaceholderText('Choose a primary diagnosis');
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

  mockSaveVisitNote.mockResolvedValueOnce({ status: 201, body: 'Condition created' } as unknown as Awaited<
    ReturnType<typeof saveVisitNote>
  >);
  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);

  renderVisitNotesForm();

  const clinicalNote = screen.getByRole('textbox', { name: /Write your notes/i });
  await user.type(clinicalNote, 'x');
  const submitButton = screen.getByRole('button', { name: /Save and close/i });
  await user.click(submitButton);

  expect(screen.getByText(/choose at least one primary diagnosis/i)).toBeInTheDocument();

  await user.clear(clinicalNote);
  const searchBox = screen.getByPlaceholderText('Choose a primary diagnosis');
  await user.type(searchBox, 'Diabetes Mellitus');
  const targetSearchResult = await screen.findByText('Diabetes Mellitus');
  expect(targetSearchResult).toBeInTheDocument();

  await user.click(targetSearchResult);

  await user.clear(clinicalNote);
  await user.type(clinicalNote, 'Sample clinical note');
  expect(clinicalNote).toHaveValue('Sample clinical note');

  await user.click(submitButton);

  expect(mockSaveVisitNote).toHaveBeenCalledTimes(1);
  expect(mockSaveVisitNote).toHaveBeenCalledWith(new AbortController(), expect.objectContaining(successPayload));
  mockConsoleError.mockRestore();
});

test('attaches the visit from the visit context to a newly created note', async () => {
  const user = userEvent.setup();

  mockSaveVisitNote.mockResolvedValueOnce({ status: 201, body: 'Condition created' } as unknown as Awaited<
    ReturnType<typeof saveVisitNote>
  >);
  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);

  renderVisitNotesForm({}, { visitContext: { uuid: 'visit-context-uuid' } as Visit });

  const searchBox = screen.getByPlaceholderText('Choose a primary diagnosis');
  await user.type(searchBox, 'Diabetes Mellitus');
  await user.click(await screen.findByText('Diabetes Mellitus'));

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

  const searchBox = screen.getByPlaceholderText('Choose a primary diagnosis');
  await user.type(searchBox, 'Diabetes Mellitus');
  await user.click(await screen.findByText('Diabetes Mellitus'));

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

  const searchBox = screen.getByPlaceholderText('Choose a primary diagnosis');
  await user.type(searchBox, 'Diabetes Mellitus');
  await user.click(await screen.findByText('Diabetes Mellitus'));

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

  const searchBox = screen.getByPlaceholderText('Choose a primary diagnosis');
  await user.type(searchBox, 'Diabetes Mellitus');
  const targetSearchResult = await screen.findByText('Diabetes Mellitus');
  expect(targetSearchResult).toBeInTheDocument();

  await user.click(targetSearchResult);

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

test.each(['small-desktop', 'tablet'] as const)(
  'initializes the edit form with existing encounter data on %s',
  (layout) => {
    vi.mocked(useLayoutType).mockReturnValue(layout);
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

    expect(screen.getAllByText('Edit visit note')).toHaveLength(layout === 'tablet' ? 2 : 1);
    expect(screen.queryByText('Add visit note')).not.toBeInTheDocument();

    // Verify date is pre-filled
    expect(screen.getByLabelText(/visit date/i)).toHaveValue('20/03/2024');

    // Verify clinical note is pre-filled
    expect(screen.getByRole('textbox', { name: /write your notes/i })).toHaveValue('Existing clinical note');

    // Verify diagnosis is pre-filled
    expect(screen.getByTitle('Diabetes Mellitus')).toBeInTheDocument();
  },
);

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
  expect(screen.getByTitle('Diabetes Mellitus')).toBeInTheDocument();

  // Remove existing diagnosis
  const closeTagButton = screen.getByRole('button', { name: /clear filter/i });
  await user.click(closeTagButton);

  // Verify no diagnoses are selected
  expect(screen.getByText(/No diagnosis selected — Enter a diagnosis below/i)).toBeInTheDocument();

  // Add new diagnosis
  const searchBox = screen.getByPlaceholderText('Choose a primary diagnosis');
  await user.type(searchBox, 'Diabetes Mellitus');
  const targetSearchResult = await screen.findByText('Diabetes Mellitus');
  await user.click(targetSearchResult);

  // Verify new diagnosis is displayed
  expect(screen.getByTitle('Diabetes Mellitus')).toBeInTheDocument();
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

test.each(['primary', 'secondary'].flatMap((rank) => ['result', 'outside', 'body'].map((target) => [rank, target])))(
  'allows continued typing after %s diagnosis results refresh when the user chooses %s',
  async (rank, target) => {
    mockFetchDiagnosisConceptsByName.mockImplementation((query) =>
      query.endsWith('x') ? new Promise(() => {}) : Promise.resolve(diagnosisSearchResponse.results),
    );
    renderVisitNotesForm();
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText(`Choose a ${rank} diagnosis`);
    await user.type(input, 'Diabetes');
    const result = await screen.findByRole('button', { name: 'Diabetes Mellitus' });
    await user.type(input, 'x');
    await user.keyboard('{ArrowDown}');
    expect(result).toHaveFocus();
    const outside = screen.getByRole('textbox', { name: /Write your notes/i });
    if (target === 'outside') await user.click(outside);
    if (target === 'body') await user.click(screen.getByText('Search for a primary diagnosis', { exact: true }));
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
      rawDatetime: '2024-03-20T10:00:00.000Z',
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
          rawDatetime: '2024-03-20T10:00:00.000Z',
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
  rawDatetime: '2024-03-20T10:00:00.000Z',
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

test('shows the images already saved on the note without remove controls and never re-uploads them', async () => {
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
  expect(screen.queryByRole('button', { name: /remove image/i })).not.toBeInTheDocument();
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
