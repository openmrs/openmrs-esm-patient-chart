import useSWRImmutable from 'swr/immutable';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { OpenMRSResource } from '../../types';

interface ConceptFetchResponse {
  results: Array<{
    setMembers: Array<OpenMRSResource>;
  }>;
}

export interface Allergens {
  allergicReactions: Array<Record<string, string>>;
  drugAllergens: Array<Record<string, string>>;
  environmentalAllergens: Array<Record<string, string>>;
  foodAllergens: Array<Record<string, string>>;
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

export function useAllergensAndAllergicReactions() {
  const {
    concepts: { drugAllergenUuid, environmentalAllergenUuid, foodAllergenUuid, allergyReactionUuid },
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
  const { data: allergicReactionsData } = useSWRImmutable<{ data: ConceptFetchResponse }>(
    `/ws/rest/v1/concept/${allergyReactionUuid}?v=full`,
    openmrsFetch,
  );

  const extractData = (allergenData) =>
    allergenData?.data?.setMembers?.map((allergen) => {
      return { uuid: allergen.uuid, display: allergen.display };
    });

  const drugAllergens = extractData(drugAllergenData);
  const environmentalAllergens = extractData(environmentalAllergenData);
  const foodAllergens = extractData(foodAllergenData);
  const allergicReactions = extractData(allergicReactionsData);

  return {
    isLoading: !drugAllergenData || !environmentalAllergenData || !foodAllergenData || !allergicReactionsData,
    allergensAndAllergicReactions: {
      drugAllergens,
      foodAllergens,
      environmentalAllergens,
      allergicReactions,
    },
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
