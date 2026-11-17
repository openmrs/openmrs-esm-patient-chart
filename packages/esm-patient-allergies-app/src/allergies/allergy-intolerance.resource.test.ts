import { describe, expect, it, type Mock } from 'vitest';
import { renderHook } from '@testing-library/react';
import { fhirBaseUrl, useFhirFetchAll } from '@openmrs/esm-framework';
import { mockFhirAllergyIntoleranceResponse } from '__mocks__';
import { mockPatient } from 'tools';
import { useAllergies } from './allergy-intolerance.resource';

const mockUseFhirFetchAll = useFhirFetchAll as Mock;
const [baseAllergy] = mockFhirAllergyIntoleranceResponse.entry.map((entry) => entry.resource);

// One more allergy than the FHIR server returns on a single page by default (10).
const elevenAllergies = Array.from({ length: 11 }, (_, index) => ({
  ...baseAllergy,
  id: `allergy-${index + 1}`,
  code: { ...baseAllergy.code, text: `Allergen ${index + 1}` },
}));

describe('useAllergies', () => {
  it('fetches every page of allergies for the patient', () => {
    mockUseFhirFetchAll.mockReturnValue({ data: [] });

    renderHook(() => useAllergies(mockPatient.id));

    expect(mockUseFhirFetchAll).toHaveBeenCalledWith(`${fhirBaseUrl}/AllergyIntolerance?patient=${mockPatient.id}`);
  });

  it('keeps every allergy, including those beyond the first page', () => {
    mockUseFhirFetchAll.mockReturnValue({ data: elevenAllergies });

    const { result } = renderHook(() => useAllergies(mockPatient.id));

    expect(result.current.allergies).toHaveLength(11);
    expect(result.current.allergies.map((allergy) => allergy.display)).toContain('Allergen 11');
  });

  it('does not fetch when there is no patient', () => {
    mockUseFhirFetchAll.mockReturnValue({ data: undefined });

    renderHook(() => useAllergies(undefined));

    expect(mockUseFhirFetchAll).toHaveBeenLastCalledWith(null);
  });
});
