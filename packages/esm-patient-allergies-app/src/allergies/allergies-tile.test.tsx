import React from 'react';
import { screen } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { mockFhirAllergyIntoleranceResponse } from '__mocks__';
import AllergiesTile from './allergies-tile.component';

const testProps = {
  patientUuid: mockPatient.id,
};

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

describe('AllergiesTile', () => {
  it('renders an empty state when allergy data is not available', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: [] });
    renderAllergiesTile();

    await waitForLoadingToFinish();

    expect(screen.getByText(/allergies/i)).toBeInTheDocument();
    expect(screen.getByText(/--/i)).toBeInTheDocument();
  });

  it("renders a summary of the patient's allergy data when available", async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockFhirAllergyIntoleranceResponse });
    renderAllergiesTile();

    await waitForLoadingToFinish();

    expect(screen.getByText(/allergies/i)).toBeInTheDocument();
    expect(screen.getByText(/ACE inhibitors, Fish, Penicillins, Morphine, Aspirin/i)).toBeInTheDocument();
  });
});

function renderAllergiesTile() {
  renderWithSwr(<AllergiesTile {...testProps} />);
}
