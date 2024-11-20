import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import {
  type TestOrderBasketItem,
  type OrderBasketItem,
  type OrderTypeJavaClassName,
  prepOrderPostData,
  useOrderBasket,
} from '@openmrs/esm-patient-common-lib';
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

export function useGenericOrderBasket<T extends OrderBasketItem>(orderTypeUuid: string) {
  const prepOrderPostFunc = useMemo(() => prepOrderPostData(orderTypeUuid), [orderTypeUuid]);
  return useOrderBasket<T>(orderTypeUuid, prepOrderPostFunc);
}

function openmrsFetchMultiple(urls: Array<string>) {
  // SWR has an RFC for `useSWRList`:
  // https://github.com/vercel/swr/discussions/1988
  // If that ever is implemented we should switch to using that.
  return Promise.all(urls.map((url) => openmrsFetch<{ results: Array<Concept> }>(url)));
}

function useOrderableConceptSWR(searchTerm: string, conceptClass: string, orderableConcepts?: Array<string>) {
  const { data, isLoading, error } = useSWRImmutable<Array<ConceptResult> | ConceptResults>(
    () =>
      orderableConcepts?.length
        ? orderableConcepts.map(
            (c) =>
              `${restBaseUrl}/concept/${c}?v=custom:(display,names:(display),uuid,setMembers:(display,uuid,names:(display),setMembers:(display,uuid,names:(display))))`,
          )
        : `${restBaseUrl}/concept?class=${conceptClass}&name=${searchTerm}&searchType=fuzzy&v=custom:(display,names:(display),uuid,setMembers:(display,uuid,names:(display),setMembers:(display,uuid,names:(display))))`,
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

export interface ConceptType {
  label: string;
  conceptUuid: string;
  synonyms: Array<string>;
}

export function useOrderableConcepts(searchTerm: string, conceptClass: string, orderableConcepts: Array<string>) {
  const { data, isLoading, error } = useOrderableConceptSWR(
    searchTerm,
    conceptClass,
    orderableConcepts.length ? orderableConcepts : null,
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
          label: concept.display,
          conceptUuid: concept.uuid,
          synonyms: concept.names?.flatMap((name) => name.display) ?? [],
        }))
        ?.sort((testConcept1, testConcept2) => testConcept1.label.localeCompare(testConcept2.label))
        ?.filter((item, pos, array) => !pos || array[pos - 1].conceptUuid !== item.conceptUuid),
    [data],
  );

  return {
    concepts,
    isLoading: isLoading,
    error: error,
  };
}

export function matchOrder(javaClassName: OrderTypeJavaClassName, order: OrderBasketItem, concept: ConceptType) {
  switch (javaClassName) {
    // case 'org.openmrs.DrugOrder':
    //   return order1.action === order2.action && order1.commonMedicationName === order2.commonMedicationName;
    case 'org.openmrs.TestOrder':
      return (order as TestOrderBasketItem).testType.conceptUuid === concept.conceptUuid;
  }
}
