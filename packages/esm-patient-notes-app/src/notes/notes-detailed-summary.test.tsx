import React from 'react';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs/internal/observable/throwError';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { openmrsObservableFetch } from '@openmrs/esm-framework';
import NotesOverview from './notes-overview.component';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { mockPatientEncountersRESTAPI } from '../../../../__mocks__/encounters.mock';

const testProps = {
  basePath: '/',
  patient: mockPatient,
  patientUuid: mockPatient.id,
  showAddNote: false,
};

const mockOpenmrsObservableFetch = openmrsObservableFetch as jest.Mock;
const mockGetStartedVisitGetter = jest.fn();

jest.mock('@openmrs/esm-framework', () => ({
  get getStartedVisit() {
    return mockGetStartedVisitGetter();
  },
  openmrsObservableFetch: jest.fn(),
}));

const renderNotesOverview = () => render(<NotesOverview {...testProps} />);

it('renders an empty state view if encounter data is unavailable', () => {
  mockOpenmrsObservableFetch.mockReturnValue(of({ data: [] }));
  mockGetStartedVisitGetter.mockReturnValue(new BehaviorSubject(null));

  renderNotesOverview();

  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /notes/i })).toBeInTheDocument();
  expect(screen.getByText(/There are no notes to display for this patient/i)).toBeInTheDocument();
  expect(screen.getByText(/Record notes/i)).toBeInTheDocument();
});

it('renders an error state view if there is a problem fetching allergies data', () => {
  const error = {
    message: 'You are not logged in',
    response: {
      status: 401,
      statusText: 'Unauthorized',
    },
  };
  mockOpenmrsObservableFetch.mockReturnValueOnce(throwError(error));

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

it("renders an overview of the patient's encounters when present", async () => {
  mockOpenmrsObservableFetch.mockReturnValue(of({ data: mockPatientEncountersRESTAPI }));

  renderNotesOverview();

  await screen.findByRole('heading', { name: /notes/i });

  const expectedColumnHeaders = [/Date/, /encounter type/, /location/, /author/];
  expectedColumnHeaders.forEach((header) => {
    expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
  });

  expect(screen.getAllByRole('row').length).toEqual(7);
  expect(screen.getByText(/5 \/ 24 items/)).toBeInTheDocument();
  const seeAllBtn = screen.getByRole('button', { name: /see all/i });
  expect(seeAllBtn).toBeInTheDocument();

  userEvent.click(seeAllBtn);

  expect(screen.getAllByRole('row').length).toBeGreaterThan(7);
  expect(seeAllBtn).not.toBeInTheDocument();
});
