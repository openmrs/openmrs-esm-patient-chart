import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { getDefaultsFromConfigSchema, showSnackbar, useConfig, useSession } from '@openmrs/esm-framework';
import { fetchDiagnosisConceptsByName, saveVisitNote } from './visit-notes.resource';
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
  patientUuid: mockPatient.id,
  closeWorkspace: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
  promptBeforeClosing: jest.fn(),
  setTitle: jest.fn(),
};

function renderVisitNotesForm(props = {}) {
  render(<VisitNotesForm {...defaultProps} {...props} />);
}

const mockFetchDiagnosisConceptsByName = jest.mocked(fetchDiagnosisConceptsByName);
const mockSaveVisitNote = jest.mocked(saveVisitNote);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockUseConfig = jest.mocked<() => ConfigObject>(useConfig);
const mockUseSession = jest.mocked(useSession);

jest.mock('lodash-es/debounce', () => jest.fn((fn) => fn));

jest.mock('./visit-notes.resource', () => ({
  fetchDiagnosisConceptsByName: jest.fn(),
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

  expect(screen.getByRole('textbox', { name: /Visit date/i })).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: /Write your notes/i })).toBeInTheDocument();
  expect(screen.getByRole('searchbox', { name: /Enter Primary diagnoses/i })).toBeInTheDocument();
  expect(screen.getByRole('searchbox', { name: /Enter Secondary diagnoses/i })).toBeInTheDocument();
  expect(screen.getByRole('group', { name: /Add an image to this visit/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Add image/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Discard/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Save and close/i })).toBeInTheDocument();
});

test.only('typing in the diagnosis search input triggers a search', async () => {
  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);

  renderVisitNotesForm();

  const searchBox = screen.getByPlaceholderText('Choose a primary diagnosis');
  await userEvent.type(searchBox, 'Diabetes Mellitus');
  const targetSearchResult = screen.getByText('Diabetes Mellitus');
  expect(targetSearchResult).toBeInTheDocument();
  expect(screen.getByText('Diabetes Mellitus, Type II')).toBeInTheDocument();

  // clicking on a search result displays the selected diagnosis as a tag
  await userEvent.click(targetSearchResult);
  expect(screen.getByTitle('Diabetes Mellitus')).toBeInTheDocument();
  const diabetesMellitusTag = screen.getByTitle(/^Diabetes Mellitus$/i);
  expect(diabetesMellitusTag).toBeInTheDocument();

  const closeTagButton = screen.getByRole('button', { name: /clear filter/i });
  // Clicking the close button on the tag removes the selected diagnosis
  await userEvent.click(closeTagButton);
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
  renderVisitNotesForm();

  const cancelButton = screen.getByRole('button', { name: /Discard/i });
  await userEvent.click(cancelButton);

  expect(defaultProps.closeWorkspace).toHaveBeenCalledTimes(1);
});

test('renders a success snackbar upon successfully recording a visit note', async () => {
  const successPayload = {
    encounterProviders: expect.arrayContaining([
      {
        encounterRole: ConfigMock.visitNoteConfig.clinicianEncounterRole,
        provider: undefined,
      },
    ]),
    encounterType: ConfigMock.visitNoteConfig.encounterTypeUuid,
    form: ConfigMock.visitNoteConfig.formConceptUuid,
    location: undefined,
    obs: expect.arrayContaining([
      {
        concept: { display: '', uuid: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
        value: 'Sample clinical note',
      },
    ]),
    patient: mockPatient.id,
  };

  mockSaveVisitNote.mockResolvedValueOnce({ status: 201, body: 'Condition created' } as unknown as ReturnType<
    typeof saveVisitNote
  >);
  mockFetchDiagnosisConceptsByName.mockResolvedValue(diagnosisSearchResponse.results);

  renderVisitNotesForm();

  const searchBox = screen.getByPlaceholderText('Choose a primary diagnosis');
  await userEvent.type(searchBox, 'Diabetes Mellitus');
  const targetSearchResult = screen.getByText('Diabetes Mellitus');
  expect(targetSearchResult).toBeInTheDocument();

  await userEvent.click(targetSearchResult);

  const clinicalNote = screen.getByRole('textbox', { name: /Write your notes/i });
  await userEvent.clear(clinicalNote);
  await userEvent.type(clinicalNote, 'Sample clinical note');
  expect(clinicalNote).toHaveValue('Sample clinical note');

  const submitButton = screen.getByRole('button', { name: /Save and close/i });

  await userEvent.click(submitButton);

  expect(mockSaveVisitNote).toHaveBeenCalledTimes(1);
  expect(mockSaveVisitNote).toHaveBeenCalledWith(new AbortController(), expect.objectContaining(successPayload));
});

test('renders an error snackbar if there was a problem recording a condition', async () => {
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

  const searchBox = screen.getByPlaceholderText('Choose a primary diagnosis');
  await userEvent.type(searchBox, 'Diabetes Mellitus');
  const targetSearchResult = screen.getByText('Diabetes Mellitus');
  expect(targetSearchResult).toBeInTheDocument();

  await userEvent.click(targetSearchResult);

  const clinicalNote = screen.getByRole('textbox', { name: /Write your notes/i });
  await userEvent.clear(clinicalNote);
  await userEvent.type(clinicalNote, 'Sample clinical note');
  expect(clinicalNote).toHaveValue('Sample clinical note');

  const submitButton = screen.getByRole('button', { name: /Save and close/i });

  await userEvent.click(submitButton);

  expect(mockShowSnackbar).toHaveBeenCalledWith({
    isLowContrast: false,
    kind: 'error',
    subtitle: 'Internal Server Error',
    title: 'Error saving visit note',
  });
});
