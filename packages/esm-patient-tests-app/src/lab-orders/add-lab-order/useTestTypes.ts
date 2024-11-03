import { useEffect, useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import { type FetchResponse, openmrsFetch, useConfig, restBaseUrl, reportError } from '@openmrs/esm-framework';
import { type Concept } from '../../types';
import { type ConfigObject } from '../../config-schema';

type ConceptResult = FetchResponse<Concept>;
type ConceptResults = FetchResponse<{ results: Array<Concept> }>;

export interface TestType {
  label: string;
  conceptUuid: string;
  synonyms: string[];
}

export interface UseTestType {
  testTypes: Array<TestType>;
  isLoading: boolean;
  error: Error;
}

function openmrsFetchMultiple(urls: Array<string>) {
  // SWR has an RFC for `useSWRList`:
  // https://github.com/vercel/swr/discussions/1988
  // If that ever is implemented we should switch to using that.
  return Promise.all(urls.map((url) => openmrsFetch<{ results: Array<Concept> }>(url)));
}

function useTestConceptsSWR(labOrderableConcepts?: Array<string>) {
  const { data, isLoading, error } = useSWRImmutable(
    () =>
      labOrderableConcepts
        ? labOrderableConcepts.map(
            (c) =>
              `${restBaseUrl}/concept/${c}?v=custom:(display,names:(display),uuid,setMembers:(display,uuid,names:(display),setMembers:(display,uuid,names:(display))))`,
          )
        : `${restBaseUrl}/concept?class=Test?v=custom:(display,names:(display),uuid,setMembers:(display,uuid,names:(display),setMembers:(display,uuid,names:(display))))`,
    (labOrderableConcepts ? openmrsFetchMultiple : openmrsFetch) as any,
    {
      shouldRetryOnError(err) {
        return err instanceof Response;
      },
    },
  );

  const results = useMemo(() => {
    if (isLoading || error) return null;
    return labOrderableConcepts
      ? (data as Array<ConceptResult>)?.flatMap((d) => d.data.setMembers)
      : (data as ConceptResults)?.data.results ?? ([] as Concept[]);
  }, [data, isLoading, error, labOrderableConcepts]);

  return {
    data: results,
    isLoading,
    error,
  };
}

export function useTestTypes(): UseTestType {
  const { labOrderableConcepts } = useConfig<ConfigObject>().orders;
  const { data, isLoading, error } = useTestConceptsSWR(labOrderableConcepts.length ? labOrderableConcepts : null);

  useEffect(() => {
    if (error) {
      reportError(error);
    }
  }, [error]);

  const testConcepts = useMemo(
    () =>
      data
        ?.map((concept) => ({
          label: concept.display,
          conceptUuid: concept.uuid,
          synonyms: concept.names?.flatMap((name) => name.display) ?? [],
        }))
        ?.sort((testConcept1, testConcept2) => testConcept1.label.localeCompare(testConcept2.label))
        ?.filter((item, pos, array) => !pos || array[pos - 1].conceptUuid !== item.conceptUuid),
    [data],
  );

  return {
    testTypes: testConcepts,
    isLoading: isLoading,
    error: error,
  };
}
