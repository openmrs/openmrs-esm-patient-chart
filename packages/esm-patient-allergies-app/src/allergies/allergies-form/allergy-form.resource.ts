import { openmrsFetch, restBaseUrl, useConfig, type OpenmrsResource } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { ALLERGEN_TYPES, type AllergenType } from '../../types';

interface ConceptFetchResponse {
  setMembers: Array<OpenmrsResource>;
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
  disabled?: boolean;
}

export interface AllergicReaction {
  uuid: string;
  display: string;
}

export function useAllergicReactions() {
  const allergyReactionUuid = useConfig().concepts.allergyReactionUuid;
  const { data: allergicReactionsData, isLoading } = useSWRImmutable<{ data: ConceptFetchResponse }>(
    `${restBaseUrl}/concept/${allergyReactionUuid}?v=full`,
    openmrsFetch,
  );

  const allergicReactions: AllergicReaction[] = allergicReactionsData?.data.setMembers.map((allergicReaction) => {
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
    `${restBaseUrl}/concept/${drugAllergenUuid}?v=full`,
    openmrsFetch,
  );
  const { data: environmentalAllergenData } = useSWRImmutable<{ data: ConceptFetchResponse }>(
    `${restBaseUrl}/concept/${environmentalAllergenUuid}?v=full`,
    openmrsFetch,
  );
  const { data: foodAllergenData } = useSWRImmutable<{ data: ConceptFetchResponse }>(
    `${restBaseUrl}/concept/${foodAllergenUuid}?v=full`,
    openmrsFetch,
  );

  return useMemo(() => {
    const allergens: Allergen[] = [];

    const extract = (allergenData, type) => {
      allergenData?.data?.setMembers?.forEach((allergen) => {
        allergens.push({ uuid: allergen.uuid, display: allergen.display, type });
      });
    };

    extract(drugAllergenData, ALLERGEN_TYPES.DRUG);
    extract(environmentalAllergenData, ALLERGEN_TYPES.ENVIRONMENT);
    extract(foodAllergenData, ALLERGEN_TYPES.FOOD);

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
  }, [drugAllergenData, environmentalAllergenData, foodAllergenData, otherConceptUuid]);
}

export function useAllergenSearch(allergenToLookup: string) {
  const allergenConceptClassUuid = useConfig()?.concepts.allergenUuid;

  const searchURL = `${restBaseUrl}/conceptsearch?conceptClasses=${allergenConceptClassUuid}&q=${allergenToLookup}`;

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
  return openmrsFetch(`${restBaseUrl}/patient/${patientUuid}/allergy`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: payload,
    signal: abortController.signal,
  });
}

export function updatePatientAllergy(
  payload: NewAllergy,
  patientUuid: string,
  allergenUuid: string,
  abortController: AbortController,
) {
  return openmrsFetch(`${restBaseUrl}/patient/${patientUuid}/allergy/${allergenUuid}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: payload,
    signal: abortController.signal,
  });
}
