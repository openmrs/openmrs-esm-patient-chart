import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render, waitFor } from '@testing-library/react';
import { of } from 'rxjs/internal/observable/of';
import { createErrorHandler, showNotification, showToast, useConfig, useSession } from '@openmrs/esm-framework';
import { fetchDiagnosisByName, fetchLocationByUuid, fetchProviderByUuid, saveVisitNote } from './visit-notes.resource';
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
const mockFetchDiagnosisByName = fetchDiagnosisByName as jest.Mock;
const mockFetchLocationByUuid = fetchLocationByUuid as jest.Mock;
const mockFetchProviderByUuid = fetchProviderByUuid as jest.Mock;
const mockSaveVisitNote = saveVisitNote as jest.Mock;
const mockShowNotification = showNotification as jest.Mock;
const mockShowToast = showToast as jest.Mock;
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
    useConfig: jest.fn(),
  };
});

jest.mock('./visit-notes.resource', () => ({
  fetchDiagnosisByName: jest.fn(),
  fetchLocationByUuid: jest.fn(),
  fetchProviderByUuid: jest.fn(),
  saveVisitNote: jest.fn(),
}));

describe('Visit notes form: ', () => {
  beforeEach(() => {
    mockFetchLocationByUuid.mockResolvedValue(mockFetchLocationByUuidResponse);
    mockFetchProviderByUuid.mockResolvedValue(mockFetchProviderByUuidResponse);
    mockFetchDiagnosisByName.mockReturnValue(of(diagnosisSearchResponse.results));
    mockUseConfig.mockReturnValue(ConfigMock);
    mockUseSession.mockReturnValue(mockSessionDataResponse);
  });

  it('renders the visit notes form with all the relevant fields and values', () => {
    renderVisitNotesForm();

    expect(screen.getByRole('textbox', { name: /Visit date/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Write an additional note/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /Search for a diagnosis/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /Add an image to this visit/i })).toBeInTheDocument();
    expect(screen.getByRole('search', { name: /Enter diagnoses/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add image/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Discard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save and close/i })).toBeInTheDocument();
  });

  it('typing in the diagnosis search input triggers a search', () => {
    renderVisitNotesForm();

    const searchbox = screen.getByRole('searchbox');
    userEvent.type(searchbox, 'Diabetes Mellitus');
    const targetSearchResult = screen.getByText(/^Diabetes Mellitus$/);
    expect(targetSearchResult).toBeInTheDocument();
    expect(screen.getByText('Diabetes Mellitus, Type II')).toBeInTheDocument();

    // clicking on a search result displays the selected diagnosis as a tag
    userEvent.click(targetSearchResult);
    expect(screen.getByTitle('Diabetes Mellitus')).toBeInTheDocument();
    const diabetesMellitusTag = screen.getByLabelText('Clear filter Diabetes Mellitus');
    expect(diabetesMellitusTag).toHaveAttribute('class', expect.stringContaining('cds--tag--red')); // primary diagnosis tags have a red background

    const closeTagButton = screen.getByRole('button', {
      name: 'Clear filter Diabetes Mellitus',
    });
    // Clicking the close button on the tag removes the selected diagnosis
    userEvent.click(closeTagButton);
    // no selected diagnoses left
    expect(screen.getByText(/No diagnosis selected — Enter a diagnosis below/i)).toBeInTheDocument();
  });

  it('renders an error message when no matching diagnoses are found', () => {
    mockFetchDiagnosisByName.mockClear();
    mockFetchDiagnosisByName.mockReturnValue(of([]));

    renderVisitNotesForm();

    const searchbox = screen.getByRole('searchbox');
    userEvent.type(searchbox, 'COVID-21');
    expect(getByTextWithMarkup('No diagnoses found matching "COVID-21"')).toBeInTheDocument();
  });

  it('closes the form and the workspace when the cancel button is clicked', () => {
    renderVisitNotesForm();

    const cancelButton = screen.getByRole('button', { name: /Discard/i });
    userEvent.click(cancelButton);

    expect(testProps.closeWorkspace).toHaveBeenCalledTimes(1);
  });

  describe('Form Submission: ', () => {
    it('renders a success toast notification upon successfully recording a visit note', async () => {
      const successPayload = {
        encounterProviders: jasmine.arrayContaining([
          {
            encounterRole: ConfigMock.visitNoteConfig.clinicianEncounterRole,
            provider: null,
          },
        ]),
        encounterType: ConfigMock.visitNoteConfig.encounterTypeUuid,
        form: ConfigMock.visitNoteConfig.formConceptUuid,
        location: null,
        obs: jasmine.arrayContaining([
          {
            concept: ConfigMock.visitNoteConfig.encounterNoteTextConceptUuid,
            value: 'Sample clinical note',
          },
        ]),
        patient: mockPatient.id,
      };

      mockSaveVisitNote.mockResolvedValueOnce({ status: 201, body: 'Condition created' });

      renderVisitNotesForm();

      const searchbox = screen.getByRole('searchbox');
      userEvent.type(searchbox, 'Diabetes Mellitus');
      const targetSearchResult = screen.getByText(/^Diabetes Mellitus$/);
      expect(targetSearchResult).toBeInTheDocument();

      await waitFor(() => userEvent.click(targetSearchResult));

      const clinicalNote = screen.getByRole('textbox', { name: /Write an additional note/i });
      userEvent.clear(clinicalNote);
      userEvent.type(clinicalNote, 'Sample clinical note');
      expect(clinicalNote).toHaveValue('Sample clinical note');

      const submitButton = screen.getByRole('button', { name: /Save and close/i });

      await waitFor(() => userEvent.click(submitButton));

      expect(mockSaveVisitNote).toHaveBeenCalledTimes(1);
      expect(mockSaveVisitNote).toHaveBeenCalledWith(new AbortController(), jasmine.objectContaining(successPayload));
    });
  });

  it('renders an error notification if there was a problem recording a condition', async () => {
    const error = {
      message: 'Internal Server Error',
      response: {
        status: 500,
        statusText: 'Internal Server Error',
      },
    };

    mockSaveVisitNote.mockRejectedValueOnce(error);

    renderVisitNotesForm();

    const searchbox = screen.getByRole('searchbox');
    userEvent.type(searchbox, 'Diabetes Mellitus');
    const targetSearchResult = screen.getByText(/^Diabetes Mellitus$/);
    expect(targetSearchResult).toBeInTheDocument();

    await waitFor(() => userEvent.click(targetSearchResult));

    const clinicalNote = screen.getByRole('textbox', { name: /Write an additional note/i });
    userEvent.clear(clinicalNote);
    userEvent.type(clinicalNote, 'Sample clinical note');
    expect(clinicalNote).toHaveValue('Sample clinical note');

    const submitButton = screen.getByRole('button', { name: /Save and close/i });

    await waitFor(() => userEvent.click(submitButton));

    expect(mockCreateErrorHandler).toHaveBeenCalledTimes(1);
    expect(mockShowNotification).toHaveBeenCalledTimes(1);
    expect(mockShowNotification).toHaveBeenCalledWith({
      critical: true,
      description: 'Internal Server Error',
      kind: 'error',
      title: 'Error saving visit note',
    });
  });
});

function renderVisitNotesForm() {
  render(<VisitNotesForm {...testProps} />);
}
