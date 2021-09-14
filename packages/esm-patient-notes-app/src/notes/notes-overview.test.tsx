import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs/internal/observable/throwError';
import { openmrsObservableFetch, usePagination } from '@openmrs/esm-framework';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { mockPatientEncountersRESTAPI, formattedNotes } from '../../../../__mocks__/encounters.mock';
import NotesOverview from './notes-overview.component';

const testProps = {
  basePath: '/',
  patient: mockPatient,
  patientUuid: mockPatient.id,
  showAddNote: false,
};

const mockOpenmrsObservableFetch = openmrsObservableFetch as jest.Mock;
const mockUsePagination = usePagination as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...(jest.requireActual('@openmrs/esm-framework') as any),
  openmrsObservableFetch: jest.fn(),
  usePagination: jest.fn(),
  useVisit: jest.fn().mockReturnValue([{}]),
}));

jest.mock('./notes.context', () => ({
  useNotesContext: jest.fn().mockReturnValue({
    patient: mockPatient,
    patientUuid: mockPatient.id,
  }),
}));

describe('NotesOverview: ', () => {
  it("renders a tabular overview of the patient's encounters when present", async () => {
    mockOpenmrsObservableFetch.mockReturnValueOnce(of({ data: mockPatientEncountersRESTAPI }).pipe(delay(10)));
    mockUsePagination.mockReturnValueOnce({
      results: formattedNotes.slice(0, 10),
      goTo: () => {},
      currentPage: 1,
    });

    renderNotesOverview();

    await screen.findByRole('heading', { name: /notes/i });
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    const expectedColumnHeaders = [/Date/, /encounter type/, /location/, /author/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    expect(screen.getAllByRole('row').length).toEqual(11);
    expect(screen.getByText(/1–5 of 24 items/i)).toBeInTheDocument();

    const prevButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(prevButton).toBeInTheDocument();
    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).not.toBeDisabled();

    userEvent.click(nextButton);
    expect(screen.findByText(/6-10 of 24 items/i)).toBeTruthy();
    expect(prevButton).not.toBeDisabled();
  });

  it('renders an empty state view if encounter data is unavailable', async () => {
    mockOpenmrsObservableFetch.mockReturnValueOnce(of({ data: [] }));

    renderNotesOverview();

    await screen.findByRole('heading', { name: /notes/i });
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText(/There are no notes to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Record notes/i)).toBeInTheDocument();
  });

  it('renders an error state view if there is a problem fetching encounter data', async () => {
    const error = {
      message: 'You are not logged in',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };
    mockOpenmrsObservableFetch.mockReturnValueOnce(throwError(error));

    renderNotesOverview();

    await screen.findByRole('heading', { name: /notes/i });
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /notes/i })).toBeInTheDocument();
    expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above/i,
      ),
    ).toBeInTheDocument();
  });
});

function renderNotesOverview() {
  render(<NotesOverview {...testProps} />);
}
