import useSWRImmutable from 'swr/immutable';
import { Concept } from '../../panel-view/types';
import { FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { useMemo } from 'react';

export interface TestType {
  label: string;
  conceptUuid: string;
}

export interface UseTestType {
  testTypes: Array<TestType>;
  isLoading: boolean;
  error: Error;
}

export function useTestTypes(): UseTestType {
  const { data, error, isLoading } = useSWRImmutable<FetchResponse<{ results: Array<Concept> }>>(
    () => `/ws/rest/v1/concept?class=Test`,
    openmrsFetch,
    {
      shouldRetryOnError(err) {
        return err instanceof Response;
      },
    },
  );

  const testTypes = useMemo(() => {
    const results = data?.data.results ?? ([] as Concept[]);
    return results.map((concept) => ({
      label: concept.display,
      conceptUuid: concept.uuid,
    }));
  }, [data]);

  return {
    testTypes: testTypes,
    isLoading: isLoading,
    error: error,
  };
}
