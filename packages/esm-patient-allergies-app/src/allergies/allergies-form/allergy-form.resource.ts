import useSWRImmutable from 'swr/immutable';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import type { OpenMRSResource } from '../../types';
import { AllergenType } from '../../types';
import useSWR from 'swr';
import { useMemo } from 'react';

interface ConceptFetchResponse {
  setMembers: Array<OpenMRSResource>;
}

export interface NewAllergy {
  allergen: {
    allergenType: string;
    codedAllergen: {
      uuid: string;
    };
    nonCodedAllergen?: string;
  };
  severity: {
    uuid: string;
  };
  comment?: string;
  reactions: Array<{
    reaction: {
      uuid: string;
    };
  }>;
}

export type CodedAllergen = {
  concept: {
    uuid: string;
    display: string;
  };
  conceptName: {
    uuid: string;
    display: string;
  };
  display: string;
};

export interface Allergen {
  uuid: string;
  display: string;
  type: AllergenType;
}

export function useAllergicReactions() {
  const allergyReactionUuid = useConfig().concepts.allergyReactionUuid;
  const { data: allergicReactionsData, isLoading } = useSWRImmutable<{ data: ConceptFetchResponse }>(
    `/ws/rest/v1/concept/${allergyReactionUuid}?v=full`,
    openmrsFetch,
  );

  const allergicReactions = allergicReactionsData?.data.setMembers.map((allergicReaction) => {
    return { uuid: allergicReaction.uuid, display: allergicReaction.display };
  });

  return {
    isLoading,
    allergicReactions: allergicReactions,
  };
}

export function useAllergens() {
  const {
    concepts: { drugAllergenUuid, environmentalAllergenUuid, foodAllergenUuid, otherConceptUuid },
  } = useConfig();

  const { data: drugAllergenData } = useSWRImmutable<{ data: ConceptFetchResponse }>(
    `/ws/rest/v1/concept/${drugAllergenUuid}?v=full`,
    openmrsFetch,
  );
  const { data: environmentalAllergenData } = useSWRImmutable<{ data: ConceptFetchResponse }>(
    `/ws/rest/v1/concept/${environmentalAllergenUuid}?v=full`,
    openmrsFetch,
  );
  const { data: foodAllergenData } = useSWRImmutable<{ data: ConceptFetchResponse }>(
    `/ws/rest/v1/concept/${foodAllergenUuid}?v=full`,
    openmrsFetch,
  );

  return useMemo(() => {
    const allergens: Allergen[] = [];

    const extract = (allergenData, type) => {
      allergenData?.data?.setMembers?.forEach((allergen) => {
        allergens.push({ uuid: allergen.uuid, display: allergen.display, type });
      });
    };

    extract(drugAllergenData, AllergenType.DRUG);
    extract(environmentalAllergenData, AllergenType.ENVIRONMENT);
    extract(foodAllergenData, AllergenType.FOOD);

    // remove if uuid is otherConceptUuid
    allergens.forEach((allergen, index) => {
      if (allergen.uuid === otherConceptUuid) {
        allergens.splice(index, 1);
      }
    });

    // Sort allergens alphabetically
    allergens.sort((a, b) => a.display.localeCompare(b.display));

    return {
      allergens,
      isLoading: !drugAllergenData || !environmentalAllergenData || !foodAllergenData,
    };
  }, [drugAllergenData, environmentalAllergenData, foodAllergenData]);
}

export function useAllergenSearch(allergenToLookup: string) {
  const allergenConceptClassUuid = useConfig()?.concepts.allergenUuid;

  const searchURL = `/ws/rest/v1/conceptsearch?conceptClasses=${allergenConceptClassUuid}&q=${allergenToLookup}`;

  const { data, error, isLoading } = useSWR<{ data: { results: Array<CodedAllergen> } }, Error>(
    allergenToLookup ? searchURL : null,
    openmrsFetch,
  );

  return {
    searchResults: data?.data?.results ?? [],
    error: error,
    isSearching: isLoading,
  };
}

export function saveAllergy(payload: NewAllergy, patientUuid: string, abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/patient/${patientUuid}/allergy`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: payload,
    signal: abortController.signal,
  });
}
