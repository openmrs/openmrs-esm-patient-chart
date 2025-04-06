import { mockAllergyResult } from '../__mocks__/allergies.mock';
import { mockFhirConditionsResponse } from '../__mocks__/conditions.mock';
import { mockPatientEncounters } from '../__mocks__/encounters.mock';
import { mockDrugSearchResultApiData } from '../__mocks__/medication.mock';
// Import other patient data mocks as needed

type PatientDataCategory = 'allergies' | 'conditions' | 'encounters' | 'medications';

interface SearchResult {
  category: PatientDataCategory;
  data: any;
}

/**
 * Perform a smart search across all patient data categories.
 * @param keyword The search keyword.
 * @returns An array of search results.
 */
export function smartSearch(keyword: string): SearchResult[] {
  const lowerKeyword = keyword.toLowerCase();

  const searchInCategory = (category: PatientDataCategory, data: any[]) => {
    return data
      .filter((item) => JSON.stringify(item).toLowerCase().includes(lowerKeyword))
      .map((result) => ({ category, data: result }));
  };

  const results: SearchResult[] = [
    ...searchInCategory('allergies', Array.isArray(mockAllergyResult) ? mockAllergyResult : [mockAllergyResult]),
    ...searchInCategory(
      'conditions',
      mockFhirConditionsResponse.entry.map((entry) => entry.resource),
    ),
    ...searchInCategory(
      'encounters',
      Array.isArray(mockPatientEncounters) ? mockPatientEncounters : [mockPatientEncounters],
    ),
    ...searchInCategory('medications', mockDrugSearchResultApiData),
    // Add other categories here
  ];

  return results;
}
