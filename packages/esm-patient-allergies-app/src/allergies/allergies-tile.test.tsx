import React from 'react';
import { describe, it, expect, type Mock } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { useFhirFetchAll } from '@openmrs/esm-framework';
import { mockPatient, renderWithSwr } from 'tools';
import { mockFhirAllergyIntoleranceResponse } from '__mocks__';
import AllergiesTile from './allergies-tile.extension';

const mockUseFhirFetchAll = useFhirFetchAll as Mock;
const mockAllergyResources = mockFhirAllergyIntoleranceResponse.entry.map((entry) => entry.resource);

describe('AllergiesTile', () => {
  it('renders an empty state when allergy data is not available', async () => {
    mockUseFhirFetchAll.mockReturnValueOnce({ data: [] });
    renderWithSwr(<AllergiesTile patientUuid={mockPatient.id} />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/allergies/i)).toBeInTheDocument();
    expect(screen.getByText(/unknown/i)).toBeInTheDocument();
  });

  it("renders a summary of the patient's allergy data when available", async () => {
    mockUseFhirFetchAll.mockReturnValueOnce({ data: mockAllergyResources });
    renderWithSwr(<AllergiesTile patientUuid={mockPatient.id} />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/allergies/i)).toBeInTheDocument();
    expect(screen.getByText(/ACE inhibitors, Fish, Penicillins, Morphine, Aspirin/i)).toBeInTheDocument();
  });
});
