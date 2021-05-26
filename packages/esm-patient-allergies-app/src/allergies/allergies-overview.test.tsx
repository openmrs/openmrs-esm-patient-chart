import React from 'react';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs/internal/observable/throwError';
import { render, screen } from '@testing-library/react';
import { openmrsObservableFetch } from '@openmrs/esm-framework';
import { mockFhirAllergyIntoleranceResponse } from '../../../../__mocks__/allergies.mock';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import AllergiesOverview from './allergies-overview.component';

const testProps = {
  patient: mockPatient,
  basePath: '/',
  showAddAllergy: false,
};

const mockOpenmrsObservableFetch = openmrsObservableFetch as jest.Mock;

mockOpenmrsObservableFetch.mockImplementation(jest.fn());

const renderAllergiesOverview = () => render(<AllergiesOverview {...testProps} />);

it('renders an empty state view if allergy data is unavailable', () => {
  mockOpenmrsObservableFetch.mockReturnValue(of({ data: [] }));

  renderAllergiesOverview();

  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /allergies/i })).toBeInTheDocument();
  expect(screen.getByText(/There are no allergy intolerances to display for this patient/i)).toBeInTheDocument();
  expect(screen.getByText(/Record allergy intolerances/i)).toBeInTheDocument();
});

it('renders an error state view if there is a problem fetching allergies data', () => {
  const error = {
    message: 'You are not logged in',
    response: {
      status: 401,
      statusText: 'Unauthorized',
    },
  };
  mockOpenmrsObservableFetch.mockReturnValue(throwError(error));

  renderAllergiesOverview();

  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /allergies/i })).toBeInTheDocument();
  expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
  expect(
    screen.getByText(
      /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above/i,
    ),
  ).toBeInTheDocument();
});

it("renders an overview of the patient's allergic reactions and their manifestations", async () => {
  mockOpenmrsObservableFetch.mockReturnValue(of({ data: mockFhirAllergyIntoleranceResponse }));

  renderAllergiesOverview();

  await screen.findByRole('heading', { name: /allergies/i });

  const expectedColumnHeaders = [/name/, /reactions/];
  const expectedAllergies = [
    /ACE inhibitors Anaphylaxis \(moderate\)/,
    /Aspirin Mental status change \(severe\)/,
    /Fish Anaphylaxis, Angioedema, Fever, Hives \(mild\)/,
    /Morphine Mental status change \(severe\)/,
    /Penicillins Diarrhea, Cough, Musculoskeletal pain, Mental status change, Angioedema \(Severe\)/,
  ];

  expect(screen.getByRole('heading', { name: /allergies/i })).toBeInTheDocument();
  expectedColumnHeaders.forEach((header) => {
    expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
  });
  expectedAllergies.forEach((allergy) => {
    expect(screen.getByRole('row', { name: new RegExp(allergy, 'i') })).toBeInTheDocument();
  });

  expect(screen.queryByRole('button', { name: /add/i })).not.toBeInTheDocument();

  testProps.showAddAllergy = true;

  renderAllergiesOverview();

  expect(await screen.queryByRole('button', { name: /add/i })).toBeInTheDocument();
});
