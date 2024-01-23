import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import fuzzy from 'fuzzy';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { type Concept } from '../../types';

export interface TestType {
  label: string;
  conceptUuid: string;
}

export interface UseTestType {
  testTypes: Array<TestType>;
  isLoading: boolean;
  error: Error;
}

export function useTestTypes(searchTerm: string = ''): UseTestType {
  const { data, error, isLoading } = useSWRImmutable<FetchResponse<{ answers: Array<Concept> }>>(
    () => `/ws/rest/v1/concept/1271AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA?v=custom:(answers)`,
    openmrsFetch,
    {
      shouldRetryOnError(err) {
        return err instanceof Response;
      },
    },
  );

  const testTypes = useMemo(() => {
    const results = data?.data.answers ?? ([] as Concept[]);
    return results.map((concept) => ({
      label: concept.display,
      conceptUuid: concept.uuid,
    }));
  }, [data]);

  const filteredTestTypes = useMemo(() => {
    return searchTerm
      ? fuzzy.filter(searchTerm, testTypes, { extract: (testType) => testType.label }).map((result) => result.original)
      : testTypes;
  }, [testTypes, searchTerm]);

  return {
    testTypes: filteredTestTypes,
    isLoading: isLoading,
    error: error,
  };
}
