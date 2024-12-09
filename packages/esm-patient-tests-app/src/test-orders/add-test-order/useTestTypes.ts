import { useOrderableConceptSets } from '@openmrs/esm-patient-common-lib';
import { useMemo } from 'react';

export interface TestType {
  label: string;
  conceptUuid: string;
  synonyms: Array<string>;
}

export function useTestTypes(
  searchTerm: string,
  orderableConceptSets: Array<string>,
): {
  testTypes: Array<TestType>;
  isLoading: Boolean;
  error: Error;
} {
  const { concepts, isLoading, error } = useOrderableConceptSets(searchTerm, orderableConceptSets);

  const results = useMemo(
    () => ({
      testTypes: concepts
        ? concepts.map(({ display, uuid, synonyms }) => ({
            label: display,
            conceptUuid: uuid,
            synonyms,
          }))
        : [],
      isLoading,
      error,
    }),
    [isLoading, concepts, error],
  );
  return results;
}
