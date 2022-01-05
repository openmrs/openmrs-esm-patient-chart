import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OpenMRSResource } from '../../types';
import { openmrsFetch, openmrsObservableFetch } from '@openmrs/esm-framework';

interface AllergenReaction {
  setMembers: Array<OpenMRSResource>;
}

export type Allergens = {
  allergicReactions: Array<Record<string, string>>;
  drugAllergens: Array<Record<string, string>>;
  environmentalAllergens: Array<Record<string, string>>;
  foodAllergens: Array<Record<string, string>>;
};

export const fetchAllergensAndAllergicReactions = (concepts: Array<string>): Observable<Allergens> => {
  const response = concepts.map((concept) =>
    openmrsObservableFetch<AllergenReaction>(`/ws/rest/v1/concept/${concept}?v=full`).pipe(
      map(({ data }) =>
        data.setMembers.map((allergen) => {
          return { uuid: allergen.uuid, display: allergen.display };
        }),
      ),
    ),
  );

  return forkJoin([...response]).pipe(
    map((response) => {
      const drugAllergens = response[0];
      const foodAllergens = response[1];
      const environmentalAllergens = response[2];
      const allergicReactions = response[3];
      return { drugAllergens, foodAllergens, environmentalAllergens, allergicReactions };
    }),
  );
};

export type NewAllergy = {
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
};

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
