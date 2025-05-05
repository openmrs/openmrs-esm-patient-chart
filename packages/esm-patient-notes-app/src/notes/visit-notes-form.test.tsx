import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { getDefaultsFromConfigSchema, showSnackbar, useConfig, useSession } from '@openmrs/esm-framework';
import { fetchDiagnosisConceptsByName, saveVisitNote, updateVisitNote } from './visit-notes.resource';
import {
  ConfigMock,
  diagnosisSearchResponse,
  mockFetchLocationByUuidResponse,
  mockFetchProviderByUuidResponse,
  mockSessionDataResponse,
} from '__mocks__';
import { configSchema, type ConfigObject } from '../config-schema';
import { mockPatient, getByTextWithMarkup } from 'tools';
import VisitNotesForm from './visit-notes-form.workspace';

const defaultProps = {
  closeWorkspace: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
  formContext: 'creating' as const,
  patient: mockPatient,
  patientUuid: mockPatient.id,
  promptBeforeClosing: jest.fn(),
  setTitle: jest.fn(),
};

function renderVisitNotesForm(props = {}) {
  render(<VisitNotesForm {...defaultProps} {...props} />);
}

const mockFetchDiagnosisConceptsByName = jest.mocked(fetchDiagnosisConceptsByName);
const mockSaveVisitNote = jest.mocked(saveVisitNote);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockUpdateVisitNote = jest.mocked(updateVisitNote);
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockUseSession = jest.mocked(useSession);

jest.mock('lodash-es/debounce', () => jest.fn((fn) => fn));

jest.mock('./visit-notes.resource', () => ({
  fetchDiagnosisConceptsByName: jest.fn(),
  updateVisitNote: jest.fn(),
  useLocationUuid: jest.fn().mockImplementation(() => ({
    data: mockFetchLocationByUuidResponse.data.uuid,
  })),
  useProviderUuid: jest.fn().mockImplementation(() => ({
    data: mockFetchProviderByUuidResponse.data.uuid,
  })),
  saveVisitNote: jest.fn(),
  useVisitNotes: jest.fn().mockImplementation(() => ({
    mutateVisitNotes: jest.fn(),
  })),
  useInfiniteVisits: jest.fn().mockImplementation(() => ({
    mutateVisits: jest.fn(),
  })),
}));

mockUseSession.mockReturnValue(mockSessionDataResponse.data);
mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  ...ConfigMock,
});

test('renders the visit notes form with all the relevant fields and values', () => {
  mockFetchDiagnosisConceptsByName.mockResolvedValue([]);

  renderVisitNotesForm();

  expect(screen.getByLabelText(/visit date/i)).toBeInTheDocument();
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
  const targetSearchResult = screen.getByText('Diabetes Mellitus');
  expect(targetSearchResult).toBeInTheDocument();
  expect(screen.getByText('Diabetes Mellitus, Type II')).toBeInTheDocument();

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

test('renders an error message when no matching diagnoses are found', async () => {
  const user = userEvent.setup();
  mockFetchDiagnosisConceptsByName.mockResolvedValue([]);

  renderVisitNotesForm();

  const searchBox = screen.getByPlaceholderText('Choose a primary diagnosis');
  await user.type(searchBox, 'COVID-21');

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
  const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

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

  mockSaveVisitNote.mockResolvedValueOnce({ status: 201, body: 'Condition created' } as unknown as ReturnType<
    typeof saveVisitNote
  >);
  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);

  renderVisitNotesForm();

  const submitButton = screen.getByRole('button', { name: /Save and close/i });
  await user.click(submitButton);

  expect(screen.getByText(/choose at least one primary diagnosis/i)).toBeInTheDocument();

  const searchBox = screen.getByPlaceholderText('Choose a primary diagnosis');
  await user.type(searchBox, 'Diabetes Mellitus');
  const targetSearchResult = screen.getByText('Diabetes Mellitus');
  expect(targetSearchResult).toBeInTheDocument();

  await user.click(targetSearchResult);

  const clinicalNote = screen.getByRole('textbox', { name: /Write your notes/i });
  await user.clear(clinicalNote);
  await user.type(clinicalNote, 'Sample clinical note');
  expect(clinicalNote).toHaveValue('Sample clinical note');

  await user.click(submitButton);

  expect(mockSaveVisitNote).toHaveBeenCalledTimes(1);
  expect(mockSaveVisitNote).toHaveBeenCalledWith(new AbortController(), expect.objectContaining(successPayload));
  mockConsoleError.mockRestore();
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
  const targetSearchResult = screen.getByText('Diabetes Mellitus');
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

test('initializes form with existing encounter data when in edit mode', () => {
  const mockEncounter = {
    id: '123',
    uuid: '123',
    datetime: '2024-03-20T10:00:00.000Z',
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
    encounter: mockEncounter,
  });

  // Verify date is pre-filled
  expect(screen.getByLabelText(/visit date/i)).toHaveValue('20/03/2024');

  // Verify clinical note is pre-filled
  expect(screen.getByRole('textbox', { name: /write your notes/i })).toHaveValue('Existing clinical note');

  // Verify diagnosis is pre-filled
  expect(screen.getByTitle('Diabetes Mellitus')).toBeInTheDocument();
});

test('updates existing visit note when in edit mode', async () => {
  const user = userEvent.setup();
  const mockEncounter = {
    id: '123',
    uuid: '123',
    datetime: '2024-03-20T10:00:00.000Z',
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
  mockUpdateVisitNote.mockResolvedValueOnce({ status: 200, body: 'Visit note updated' } as unknown as ReturnType<
    typeof updateVisitNote
  >);

  renderVisitNotesForm({
    formContext: 'editing',
    encounter: mockEncounter,
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
    datetime: '2024-03-20T10:00:00.000Z',
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
  const targetSearchResult = screen.getByText('Diabetes Mellitus');
  await user.click(targetSearchResult);

  // Verify new diagnosis is displayed
  expect(screen.getByTitle('Diabetes Mellitus')).toBeInTheDocument();
});
