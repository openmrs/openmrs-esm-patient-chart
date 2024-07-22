import React from 'react';
import { screen, within } from '@testing-library/react';
import { mockVisitNotes } from '__mocks__';
import { mockPatient, patientChartBasePath, renderWithSwr } from 'tools';
import { useVisitNotes } from './visit-notes.resource';
import NotesMain from './notes-main.component';

const testProps = {
  patientUuid: mockPatient.id,
  pageSize: 10,
  urlLabel: window.spaBase + patientChartBasePath + '/summary',
  pageUrl: 'Go to Summary',
};

const mockUseVisitNotes = useVisitNotes as jest.Mock;

jest.mock('./visit-notes.resource', () => {
  return { useVisitNotes: jest.fn().mockReturnValue([{}]) };
});

describe('NotesMain: ', () => {
  test('renders an empty state view if encounter data is unavailable', async () => {
    mockUseVisitNotes.mockReturnValueOnce({ data: { results: [] } });

    renderNotesMain();

    expect(screen.getByRole('heading', { name: /Visit notes/i })).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText(/There are no visit notes to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Record visit notes/i)).toBeInTheDocument();
  });

  test('renders an error state view if there is a problem fetching encounter data', async () => {
    const error = {
      message: 'You are not logged in',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };
    mockUseVisitNotes.mockReturnValueOnce({ isError: error });

    renderNotesMain();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Visit notes/i })).toBeInTheDocument();
    expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above/i,
      ),
    ).toBeInTheDocument();
  });

  test("renders a tabular overview of the patient's encounters when present", async () => {
    mockUseVisitNotes.mockReturnValueOnce({ visitNotes: mockVisitNotes });

    renderNotesMain();

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /visit notes/i })).toBeInTheDocument();

    const table = screen.getByRole('table');

    const expectedColumnHeaders = [/Date/, /Diagnoses/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const expectedTableRows = [
      /27 — Jan — 2022 Malaria, Primary respiratory tuberculosis, confirmed/,
      /14 — Jan — 2022 Visit Diagnoses: Presumed diagnosis, Malaria, Primary/,
      /14 — Jan — 2022 Visit Diagnoses: Presumed diagnosis, Hemorrhage in early pregnancy, Primary/,
    ];

    expectedTableRows.map((row) =>
      expect(within(table).getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument(),
    );

    expect(screen.getAllByRole('row').length).toEqual(7);
  });
});

function renderNotesMain() {
  renderWithSwr(<NotesMain {...testProps} />);
}
