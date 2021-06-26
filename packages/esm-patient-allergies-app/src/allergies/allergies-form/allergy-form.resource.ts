import { openmrsFetch, openmrsObservableFetch } from '@openmrs/esm-framework';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

interface FetchResponse {
  uuid: string;
  display: string;
}

interface AllergenReaction {
  setMembers: Array<FetchResponse>;
}

export const fetchAllergensAndReaction = (concepts: Array<string>) => {
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
      const allergyReaction = response[3];
      return { drugAllergens, foodAllergens, environmentalAllergens, allergyReaction };
    }),
  );
};

export function savePatientAllergy(payLoad: any, patientUuid: string, abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/patient/${patientUuid}/allergy`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: payLoad,
    signal: abortController.signal,
  });
}
