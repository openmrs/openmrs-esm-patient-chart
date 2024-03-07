import React from 'react';
import { screen } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { mockFhirAllergyIntoleranceResponse } from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import AllergiesDetailedSummary from './allergies-detailed-summary.component';

const testProps = {
  patient: mockPatient,
};

const mockOpenmrsFetch = openmrsFetch as jest.Mock;
mockOpenmrsFetch.mockImplementation(jest.fn());

describe('AllergiesDetailedSummary: ', () => {
  it('renders an empty state view if allergy data is unavailable', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { entry: [] } });
    renderAllergiesDetailedSummary();

    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /allergies/i })).toBeInTheDocument();
    expect(screen.getByText(/There are no allergy intolerances to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Record allergy intolerances/i)).toBeInTheDocument();
  });

  it('renders an error state view if there was a problem fetching allergies data', async () => {
    const error = {
      message: 'You are not logged in',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };
    mockOpenmrsFetch.mockRejectedValueOnce(error);
    renderAllergiesDetailedSummary();

    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /allergies/i })).toBeInTheDocument();
    expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders a detailed summary of the patient's allergic reactions and their manifestations", async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockFhirAllergyIntoleranceResponse });
    renderAllergiesDetailedSummary();

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /allergies/i })).toBeInTheDocument();

    const expectedColumnHeaders = [/allergen/i, /severity/i, /reaction/i, /onset date and comments/i];
    const expectedAllergies = [
      /ACE inhibitors moderate Anaphylaxis/i,
      /Fish mild Anaphylaxis, Angioedema, Fever, Hives Some Comments/i,
      /Penicillins severe Mental status change, Angioedema, Cough, Diarrhea, Musculoskeletal pain Patient allergies have been noted down/i,
      /Morphine severe Mental status change Comments/i,
      /Aspirin severe Mental status change Comments/i,
    ];

    expectedColumnHeaders.forEach((header) =>
      expect(screen.getByRole('columnheader', { name: new RegExp(header) })).toBeInTheDocument(),
    );

    expectedAllergies.forEach((allergy) =>
      expect(screen.getByRole('row', { name: new RegExp(allergy) })).toBeInTheDocument(),
    );
  });

  it("renders non-coded allergen name and non-coded allergic reaction name in the detailed summary of the patient's allergies", async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockFhirAllergyIntoleranceResponse });
    renderAllergiesDetailedSummary();

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /allergies/i })).toBeInTheDocument();

    const expectedNonCodedAllergy = /non-coded allergen severe non-coded allergic reaction non coded allergic note/i;
    expect(screen.getByRole('row', { name: new RegExp(expectedNonCodedAllergy) })).toBeInTheDocument();
  });
});

function renderAllergiesDetailedSummary() {
  renderWithSwr(<AllergiesDetailedSummary {...testProps} />);
}
