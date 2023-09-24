import React from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig, usePagination } from '@openmrs/esm-framework';
import { formattedVisitNotes, mockVisitNotes } from '../__mocks__/visit-notes.mock';
import { mockPatient, patientChartBasePath, renderWithSwr } from '../../../../tools/test-helpers';
import { ConfigMock } from '../__mocks__/chart-widgets-config.mock';
import NotesOverview from './notes-overview.component';
import { useVisitNotes } from './visit-notes.resource';

jest.setTimeout(20000);

const testProps = {
  basePath: patientChartBasePath,
  patient: mockPatient,
  patientUuid: mockPatient.id,
};

const mockUseVisitNotes = useVisitNotes as jest.Mock;
const mockUsePagination = usePagination as jest.Mock;
const mockUseConfig = useConfig as jest.Mock;

jest.mock('./visit-notes.resource', () => {
  return { useVisitNotes: jest.fn().mockReturnValue([{}]) };
});

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    openmrsFetch: jest.fn(),
    usePagination: jest.fn().mockImplementation(() => ({
      currentPage: 1,
      goTo: () => {},
      results: [],
    })),
    useVisit: jest.fn().mockReturnValue([{}]),
  };
});

describe('NotesOverview: ', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue(ConfigMock);
  });

  test('renders an empty state view if visit note data is unavailable', async () => {
    mockUseVisitNotes.mockReturnValueOnce({ data: { results: [] } });

    renderNotesOverview();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /notes/i })).toBeInTheDocument();
    expect(screen.getByText(/There are no visit notes to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Record visit notes/i)).toBeInTheDocument();
  });

  test('renders an error state view if there is a problem fetching visit note data', async () => {
    const error = {
      message: 'You are not logged in',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };

    mockUseVisitNotes.mockReturnValueOnce({ isError: error });

    renderNotesOverview();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /notes/i })).toBeInTheDocument();
    expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above/i,
      ),
    ).toBeInTheDocument();
  });

  test("renders a tabular overview of the patient's visit notes when present", async () => {
    mockUseVisitNotes.mockReturnValueOnce({ visitNotes: mockVisitNotes });
    mockUsePagination.mockReturnValueOnce({
      results: formattedVisitNotes.slice(0, 10),
      goTo: () => {},
      currentPage: 1,
    });

    renderNotesOverview();

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /notes/i })).toBeInTheDocument();

    const table = screen.getByRole('table');

    const expectedColumnHeaders = [/Date/, /Diagnoses/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const expectedTableRows = [
      /27 — Jan — 2022 Malaria, Primary respiratory tuberculosis, confirmed/,
      /14 — Jan — 2022 Malaria/,
      /14 — Jan — 2022 Hemorrhage in early pregnancy/,
      /11 — Jan — 2022 Malaria/,
      /08 — Sept — 2021 Malaria, confirmed, Human immunodeficiency virus \(HIV\) disease/,
    ];

    expectedTableRows.map((row) =>
      expect(within(table).getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument(),
    );

    // Expanding a row displays any associated visit notes
    await userEvent.click(screen.getAllByRole('button', { name: /expand current row/i })[0]);
    expect(screen.getByText(/No visit note to display/i)).toBeInTheDocument();

    // Collapsing the row hides the visit note
    await userEvent.click(screen.getByRole('button', { name: /collapse current row/i }));
    expect(screen.queryByText(/No visit note to display/i)).not.toBeInTheDocument();
  });
});

function renderNotesOverview() {
  renderWithSwr(<NotesOverview {...testProps} />);
}
