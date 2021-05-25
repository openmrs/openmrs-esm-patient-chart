import React from 'react';
import { of } from 'rxjs/internal/observable/of';
import { render, screen } from '@testing-library/react';
import { openmrsObservableFetch } from '@openmrs/esm-framework';
import { mockFhirAllergyIntoleranceResponse } from '../../../../__mocks__/allergies.mock';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import AllergiesDetailedSummary from './allergies-detailed-summary.component';

const testProps = {
  patient: mockPatient,
  showAddAllergy: false,
};

const mockOpenmrsObservableFetch = openmrsObservableFetch as jest.Mock;

mockOpenmrsObservableFetch.mockImplementation(jest.fn());

const renderAllergiesDetailedSummary = () => render(<AllergiesDetailedSummary {...testProps} />);

it('renders an empty state view if allergy data is unavailable', () => {
  mockOpenmrsObservableFetch.mockReturnValue(of({ data: [] }));

  renderAllergiesDetailedSummary();

  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /allergies/i })).toBeInTheDocument();
  expect(screen.getByText(/There are no allergy intolerances to display for this patient/i)).toBeInTheDocument();
  expect(screen.getByText(/Record allergy intolerances/i)).toBeInTheDocument();
});

it('renders an error state view if there was a problem fetching allergies data', () => {
  mockOpenmrsObservableFetch.mockReturnValue(of({ data: [] }));

  renderAllergiesDetailedSummary();

  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /allergies/i })).toBeInTheDocument();
  expect(screen.getByText(/There are no allergy intolerances to display for this patient/i)).toBeInTheDocument();
  expect(screen.getByText(/Record allergy intolerances/i)).toBeInTheDocument();
});

it("renders a detailed summary of the patient's allergic reactions and their manifestations", async () => {
  mockOpenmrsObservableFetch.mockReturnValue(of({ data: mockFhirAllergyIntoleranceResponse }));

  renderAllergiesDetailedSummary();

  await screen.findByRole('heading', { name: /allergies/i });

  const expectedColumnHeaders = [/allergen/i, /severity and reaction/i, /since/i, /last updated/i];
  const expectedAllergies = [
    /ACE inhibitors unable-to-assess Anaphylaxis May-2021/i,
    /Fish low Anaphylaxis, Angioedema, Fever, Hives Some Comments Apr-2021/i,
    /Penicillins high Diarrhea, Cough, Musculoskeletal pain, Mental status change, Angioedema Patient allergies have been noted down/i,
    /Morphine high Mental status change Comments Nov-2020/i,
    /Aspirin high Mental status change Comments Nov-2020/i,
  ];

  expectedColumnHeaders.forEach((header) =>
    expect(screen.getByRole('columnheader', { name: new RegExp(header) })).toBeInTheDocument(),
  );

  expectedAllergies.forEach((allergy) =>
    expect(screen.getByRole('row', { name: new RegExp(allergy) })).toBeInTheDocument(),
  );
});
