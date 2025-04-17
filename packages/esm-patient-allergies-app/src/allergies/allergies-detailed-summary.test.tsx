import React from 'react';
import { screen } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { mockFhirAllergyIntoleranceResponse } from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import AllergiesDetailedSummary from './allergies-detailed-summary.component';

const mockOpenmrsFetch = openmrsFetch as jest.Mock;
mockOpenmrsFetch.mockImplementation(jest.fn());

describe('AllergiesDetailedSummary', () => {
  it('renders an empty state view if allergy data is unavailable', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { entry: [] } });
    renderWithSwr(<AllergiesDetailedSummary patient={mockPatient} />);
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
    renderWithSwr(<AllergiesDetailedSummary patient={mockPatient} />);
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
    renderWithSwr(<AllergiesDetailedSummary patient={mockPatient} />);
    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /allergies/i })).toBeInTheDocument();

    const expectedColumnHeaders = [/allergen/i, /severity/i, /reaction/i, /comments/i];
    const expectedAllergies = [
      /ace inhibitors moderate anaphylaxis/i,
      /fish mild anaphylaxis, angioedema, fever, hives some comments/i,
      /penicillins severe angioedema, cough, diarrhea, mental status change, musculoskeletal pain patient allergies have been noted down/i,
      /morphine severe mental status change comments/i,
      /aspirin severe mental status change comments/i,
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
    renderWithSwr(<AllergiesDetailedSummary patient={mockPatient} />);
    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /allergies/i })).toBeInTheDocument();

    const expectedNonCodedAllergy = /non-coded allergen severe non-coded allergic reaction non coded allergic note/i;
    expect(screen.getByRole('row', { name: new RegExp(expectedNonCodedAllergy) })).toBeInTheDocument();
  });
});
