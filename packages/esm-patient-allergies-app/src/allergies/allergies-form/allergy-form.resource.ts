import useSWRImmutable from 'swr/immutable';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import type { OpenMRSResource } from '../../types';

interface ConceptFetchResponse {
  results: Array<{
    setMembers: Array<OpenMRSResource>;
  }>;
}

export interface AllergensAndAllergicReactions {
  allergicReactions: Array<{ uuid: string; display: string }>;
  drugAllergens: Array<{ uuid: string; display: string }>;
  environmentalAllergens: Array<{ uuid: string; display: string }>;
  foodAllergens: Array<{ uuid: string; display: string }>;
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

  const allergensAndAllergicReactions: AllergensAndAllergicReactions = {
    allergicReactions,
    drugAllergens,
    environmentalAllergens,
    foodAllergens,
  };

  return {
    isLoading: !drugAllergenData || !environmentalAllergenData || !foodAllergenData || !allergicReactionsData,
    allergensAndAllergicReactions: allergensAndAllergicReactions,
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
