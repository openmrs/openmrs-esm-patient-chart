import { useMemo } from 'react';
import { useOrderableConceptSets } from '@openmrs/esm-patient-common-lib';

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
  isLoading: boolean;
  error: Error;
} {
  const { concepts, isLoading, error } = useOrderableConceptSets(searchTerm, orderableConceptSets);

  const mappedTestTypes = useMemo(() => {
    return concepts.map(({ display, uuid, synonyms }) => ({
      label: display,
      conceptUuid: uuid,
      synonyms,
    }));
  }, [concepts]);

  const results = useMemo(
    () => ({
      testTypes: mappedTestTypes,
      isLoading,
      error,
    }),
    [isLoading, mappedTestTypes, error],
  );
  return results;
}
