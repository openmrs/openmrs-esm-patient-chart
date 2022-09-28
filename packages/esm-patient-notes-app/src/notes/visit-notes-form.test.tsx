import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render, waitFor } from '@testing-library/react';
import { of } from 'rxjs/internal/observable/of';
import { createErrorHandler, showNotification, showToast, useConfig, useSession } from '@openmrs/esm-framework';
import {
  fetchConceptDiagnosisByName,
  fetchLocationByUuid,
  fetchProviderByUuid,
  saveVisitNote,
} from './visit-notes.resource';
import { ConfigMock } from '../../../../__mocks__/chart-widgets-config.mock';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import {
  diagnosisSearchResponse,
  mockFetchLocationByUuidResponse,
  mockFetchProviderByUuidResponse,
} from '../../../../__mocks__/visit-notes.mock';
import { mockSessionDataResponse } from '../../../../__mocks__/session.mock';
import { getByTextWithMarkup } from '../../../../tools/test-helpers';
import VisitNotesForm from './visit-notes-form.component';

const testProps = {
  patientUuid: mockPatient.id,
  closeWorkspace: jest.fn(),
  promptBeforeClosing: jest.fn(),
};

const mockCreateErrorHandler = createErrorHandler as jest.Mock;
const mockFetchDiagnosisByName = fetchConceptDiagnosisByName as jest.Mock;
const mockFetchLocationByUuid = fetchLocationByUuid as jest.Mock;
const mockFetchProviderByUuid = fetchProviderByUuid as jest.Mock;
const mockSaveVisitNote = saveVisitNote as jest.Mock;
const mockShowNotification = showNotification as jest.Mock;
const mockUseConfig = useConfig as jest.Mock;
const mockUseSession = useSession as jest.Mock;

jest.mock('lodash-es/debounce', () => jest.fn((fn) => fn));

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    createErrorHandler: jest.fn(),
    showNotification: jest.fn(),
    showToast: jest.fn(),
    useConfig: jest.fn().mockImplementation(() => ConfigMock),
    useSession: jest.fn().mockImplementation(() => mockSessionDataResponse),
  };
});

jest.mock('./visit-notes.resource', () => ({
  fetchConceptDiagnosisByName: jest.fn(),
  fetchLocationByUuid: jest.fn(),
  fetchProviderByUuid: jest.fn(),
  saveVisitNote: jest.fn(),
}));

test('renders the visit notes form with all the relevant fields and values', () => {
  mockFetchDiagnosisByName.mockReturnValue(of([]));

  renderVisitNotesForm();

  expect(screen.getByRole('textbox', { name: /Visit date/i })).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: /Write an additional note/i })).toBeInTheDocument();
  expect(screen.getByRole('search', { name: /Enter Primary diagnoses/i })).toBeInTheDocument();
  expect(screen.getByRole('search', { name: /Enter Secondary diagnoses/i })).toBeInTheDocument();
  expect(screen.getByRole('group', { name: /Add an image to this visit/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Add image/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Discard/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Save and close/i })).toBeInTheDocument();
});

test('typing in the diagnosis search input triggers a search', async () => {
  mockFetchDiagnosisByName.mockReturnValue(of(diagnosisSearchResponse.results));
  renderVisitNotesForm();

  const searchBox = screen.getByPlaceholderText('Choose a primary diagnosis');
  await userEvent.type(searchBox, 'Diabetes Mellitus');
  const targetSearchResult = screen.getByText('Diabetes Mellitus');
  expect(targetSearchResult).toBeInTheDocument();
  expect(screen.getByText('Diabetes Mellitus, Type II')).toBeInTheDocument();

  // clicking on a search result displays the selected diagnosis as a tag
  await userEvent.click(targetSearchResult);
  expect(screen.getByTitle('Diabetes Mellitus')).toBeInTheDocument();
  const diabetesMellitusTag = screen.getByLabelText('Clear filter Diabetes Mellitus');
  expect(diabetesMellitusTag).toHaveAttribute('class', expect.stringContaining('cds--tag--red')); // primary diagnosis tags have a red background

  const closeTagButton = screen.getByRole('button', {
    name: 'Clear filter Diabetes Mellitus',
  });
  // Clicking the close button on the tag removes the selected diagnosis
  await userEvent.click(closeTagButton);
  // no selected diagnoses left
  expect(screen.getByText(/No diagnosis selected — Enter a diagnosis below/i)).toBeInTheDocument();
});

test('renders an error message when no matching diagnoses are found', async () => {
  mockFetchDiagnosisByName.mockReturnValue(of([]));

  renderVisitNotesForm();

  const searchBox = screen.getByPlaceholderText('Choose a primary diagnosis');
  await userEvent.type(searchBox, 'COVID-21');

  expect(getByTextWithMarkup('No diagnoses found matching "COVID-21"')).toBeInTheDocument();
});

test('closes the form and the workspace when the cancel button is clicked', async () => {
  renderVisitNotesForm();

  const cancelButton = screen.getByRole('button', { name: /Discard/i });
  await userEvent.click(cancelButton);

  expect(testProps.closeWorkspace).toHaveBeenCalledTimes(1);
});

test('renders a success toast notification upon successfully recording a visit note', async () => {
  const successPayload = {
    encounterProviders: expect.arrayContaining([
      {
        encounterRole: ConfigMock.visitNoteConfig.clinicianEncounterRole,
        provider: null,
      },
    ]),
    encounterType: ConfigMock.visitNoteConfig.encounterTypeUuid,
    form: ConfigMock.visitNoteConfig.formConceptUuid,
    location: null,
    obs: expect.arrayContaining([
      {
        concept: { display: '', uuid: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
        value: 'Sample clinical note',
      },
    ]),
    patient: mockPatient.id,
  };

  mockSaveVisitNote.mockResolvedValueOnce({ status: 201, body: 'Condition created' });
  mockFetchDiagnosisByName.mockReturnValue(of(diagnosisSearchResponse.results));

  renderVisitNotesForm();

  const searchBox = screen.getByPlaceholderText('Choose a primary diagnosis');
  await userEvent.type(searchBox, 'Diabetes Mellitus');
  const targetSearchResult = screen.getByText('Diabetes Mellitus');
  expect(targetSearchResult).toBeInTheDocument();

  await userEvent.click(targetSearchResult);

  const clinicalNote = screen.getByRole('textbox', { name: /Write an additional note/i });
  await userEvent.clear(clinicalNote);
  await userEvent.type(clinicalNote, 'Sample clinical note');
  expect(clinicalNote).toHaveValue('Sample clinical note');

  const submitButton = screen.getByRole('button', { name: /Save and close/i });

  await userEvent.click(submitButton);

  expect(mockSaveVisitNote).toHaveBeenCalledTimes(1);
  expect(mockSaveVisitNote).toHaveBeenCalledWith(new AbortController(), expect.objectContaining(successPayload));
});

test('renders an error notification if there was a problem recording a condition', async () => {
  const error = {
    message: 'Internal Server Error',
    response: {
      status: 500,
      statusText: 'Internal Server Error',
    },
  };

  mockSaveVisitNote.mockRejectedValueOnce(error);
  mockFetchDiagnosisByName.mockReturnValue(of(diagnosisSearchResponse.results));

  renderVisitNotesForm();

  const searchBox = screen.getByPlaceholderText('Choose a primary diagnosis');
  await userEvent.type(searchBox, 'Diabetes Mellitus');
  const targetSearchResult = screen.getByText('Diabetes Mellitus');
  expect(targetSearchResult).toBeInTheDocument();

  await userEvent.click(targetSearchResult);

  const clinicalNote = screen.getByRole('textbox', { name: /Write an additional note/i });
  await userEvent.clear(clinicalNote);
  await userEvent.type(clinicalNote, 'Sample clinical note');
  expect(clinicalNote).toHaveValue('Sample clinical note');

  const submitButton = screen.getByRole('button', { name: /Save and close/i });

  await userEvent.click(submitButton);

  expect(mockShowNotification).toHaveBeenCalledWith({
    critical: true,
    description: 'Internal Server Error',
    kind: 'error',
    title: 'Error saving visit note',
  });
});

function renderVisitNotesForm() {
  mockFetchLocationByUuid.mockResolvedValue(mockFetchLocationByUuidResponse);
  mockFetchProviderByUuid.mockResolvedValue(mockFetchProviderByUuidResponse);
  mockUseConfig.mockReturnValue(ConfigMock);
  mockUseSession.mockReturnValue(mockSessionDataResponse);
  render(<VisitNotesForm {...testProps} />);
}
