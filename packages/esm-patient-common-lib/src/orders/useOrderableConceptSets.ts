import {
  type FetchResponse,
  openmrsFetch,
  type OpenmrsResource,
  reportError,
  restBaseUrl,
} from '@openmrs/esm-framework';
import { useEffect, useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';

export interface Concept {
  uuid: string;
  name: {
    display: string;
  };
  names: Array<{
    display: string;
  }>;
  conceptClass: {
    uuid: string;
  };
  answers: Array<Concept>;
  setMembers: Array<Concept>;
  display: string;
}

type ConceptResult = FetchResponse<Concept>;
type ConceptResults = FetchResponse<{ results: Array<Concept> }>;

function openmrsFetchMultiple(urls: Array<string>) {
  // SWR has an RFC for `useSWRList`:
  // https://github.com/vercel/swr/discussions/1988
  // If that ever is implemented we should switch to using that.
  return Promise.all(urls.map((url) => openmrsFetch<{ results: Array<Concept> }>(url)));
}

function useOrderableConceptSWR(searchTerm: string, orderableConceptSets?: Array<string>) {
  const { data, isLoading, error } = useSWRImmutable<Array<ConceptResult> | Array<ConceptResults>>(
    orderableConceptSets?.length
      ? orderableConceptSets.map(
          (c) =>
            `${restBaseUrl}/concept/${c}?v=custom:(display,names:(display),uuid,setMembers:(display,uuid,names:(display),setMembers:(display,uuid,names:(display))))`,
        )
      : null,
    openmrsFetchMultiple as any,
    {
      shouldRetryOnError(err) {
        return err instanceof Response;
      },
    },
  );

  const results = useMemo(() => {
    if (isLoading || error) return null;

    if (orderableConceptSets) {
      const concepts = (data as Array<ConceptResult>)?.flatMap((d) => d.data.setMembers);
      if (searchTerm) {
        return concepts?.filter((concept) =>
          concept.names.some((name) => name.display.toLowerCase().includes(searchTerm.toLowerCase())),
        );
      }
      return concepts;
    } else {
      return (data as Array<ConceptResults>)?.flatMap((d) => d.data.results) ?? ([] as Concept[]);
    }
  }, [isLoading, error, orderableConceptSets, data, searchTerm]);

  return {
    data: results,
    isLoading,
    error,
  };
}

export interface OrderableConcept extends OpenmrsResource {
  synonyms: Array<string>;
}

export function useOrderableConceptSets(searchTerm: string, orderableConcepts: Array<string>) {
  const { data, isLoading, error } = useOrderableConceptSWR(
    searchTerm,
    orderableConcepts?.length ? orderableConcepts : null,
  );

  useEffect(() => {
    if (error) {
      reportError(error);
    }
  }, [error]);

  const concepts = useMemo(
    () =>
      data
        ?.map((concept) => ({
          display: concept.display,
          uuid: concept.uuid,
          synonyms: concept.names?.flatMap((name) => name.display) ?? [],
        }))
        ?.sort((testConcept1, testConcept2) => testConcept1.display.localeCompare(testConcept2.display))
        ?.filter((item, pos, array) => !pos || array[pos - 1].uuid !== item.uuid),
    [data],
  );

  return {
    concepts,
    isLoading: isLoading,
    error: error,
  };
}
