import { useEffect, useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import { type FetchResponse, openmrsFetch, useConfig, restBaseUrl, reportError } from '@openmrs/esm-framework';
import { type Concept } from '../../types';
import { type ConfigObject } from '../../config-schema';

type ConceptResult = FetchResponse<Concept>;
type ConceptResults = FetchResponse<{ results: Array<Concept> }>;

export interface OrderableConcept {
  label: string;
  conceptUuid: string;
  synonyms: string[];
}

export interface UseTestType {
  orderableConcepts: Array<OrderableConcept>;
  isLoading: boolean;
  error: Error;
}

function openmrsFetchMultiple(urls: Array<string>) {
  // SWR has an RFC for `useSWRList`:
  // https://github.com/vercel/swr/discussions/1988
  // If that ever is implemented we should switch to using that.
  return Promise.all(urls.map((url) => openmrsFetch<{ results: Array<Concept> }>(url)));
}

function useOrderableConceptSetsSWR(
  searchTerm: string,
  orderableConcepts?: Array<string>,
  conceptClassUuid: string = 'Test',
) {
  const { data, isLoading, error } = useSWRImmutable(
    () =>
      orderableConcepts || conceptClassUuid
        ? orderableConcepts
          ? orderableConcepts.map(
              (c) =>
                `${restBaseUrl}/concept/${c}?v=custom:(display,names:(display),uuid,setMembers:(display,uuid,names:(display),setMembers:(display,uuid,names:(display))))`,
            )
          : `${restBaseUrl}/concept?class=${conceptClassUuid}&searchType=fuzzy&name=${searchTerm}&v=custom:(display,names:(display),uuid,setMembers:(display,uuid,names:(display),setMembers:(display,uuid,names:(display))))`
        : null,
    (orderableConcepts ? openmrsFetchMultiple : openmrsFetch) as any,
    {
      shouldRetryOnError(err) {
        return err instanceof Response;
      },
    },
  );

  const results = useMemo(() => {
    if (isLoading || error) return null;
    if (orderableConcepts) {
      const concepts = (data as Array<ConceptResult>)?.flatMap((d) => d.data.setMembers);
      if (searchTerm) {
        return concepts?.filter((concept) =>
          concept.names.some((name) => name.display.toLowerCase().includes(searchTerm.toLowerCase())),
        );
      }
      return concepts;
    } else {
      return (data as ConceptResults)?.data.results ?? ([] as Concept[]);
    }
  }, [isLoading, error, orderableConcepts, data, searchTerm]);

  return {
    data: results,
    isLoading,
    error,
  };
}

export function useOrderableConcepts(
  searchTerm: string,
  conceptClassUuid: string,
  orderableConceptSets: Array<string>,
): UseTestType {
  const { data, isLoading, error } = useOrderableConceptSetsSWR(
    searchTerm,
    orderableConceptSets.length ? orderableConceptSets : null,
    conceptClassUuid,
  );

  useEffect(() => {
    if (error) {
      reportError(error);
    }
  }, [error]);

  const orderableConcepts = useMemo(
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
    orderableConcepts,
    isLoading: isLoading,
    error: error,
  };
}
