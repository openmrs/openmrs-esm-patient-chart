import { openmrsFetch, openmrsObservableFetch } from "@openmrs/esm-api";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";

const ALLERGYREACTIONCONCEPT: string = "162555AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export function performPatientAllergySearch(
  patientIdentifer: string,
  abortController: AbortController
) {
  return openmrsFetch(
    `/ws/fhir/AllergyIntolerance?patient.identifier=${patientIdentifer}`,
    { signal: abortController.signal }
  );
}

export function getAllergyAllergenByConceptUuid(
  allegyUuid: string
): Observable<any> {
  return openmrsObservableFetch(
    `/ws/rest/v1/concept/${allegyUuid}?v=full`
  ).pipe(map(({ data }) => data["setMembers"]));
}

export function getAllergyReaction(): Observable<any> {
  return openmrsObservableFetch(
    `/ws/rest/v1/concept/${ALLERGYREACTIONCONCEPT}?v=full`
  ).pipe(map(({ data }) => data["setMembers"]));
}

export function savePatientAllergy(
  patientAllergy: any,
  patientUuid: string,
  abortController: AbortController
) {
  const reactions = patientAllergy.reactionsUuid.map((reaction: any) => {
    return {
      reaction: {
        uuid: reaction.uuid
      }
    };
  });

  return openmrsFetch(`/ws/rest/v1/patient/${patientUuid}/allergy`, {
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST",
    body: {
      allergen: {
        allergenType: patientAllergy.allergenType,
        codedAllergen: {
          uuid: patientAllergy.codedAllergenUuid
        }
      },
      severity: {
        uuid: patientAllergy.severityUuid
      },
      comment: patientAllergy.comment,
      reactions: reactions
    },
    signal: abortController.signal
  });
}

export function getPatientAllergyByPatientUuid(
  patientUuid: string,
  allegyUuid: any,
  abortController: AbortController
) {
  return openmrsFetch(
    `/ws/rest/v1/patient/${patientUuid}/allergy/${allegyUuid.allergyUuid}?v=full`,
    {
      signal: abortController.signal
    }
  );
}

export function updatePatientAllergy(
  patientAllergy: any,
  patientUuid: string,
  allergyUuid: any,
  abortController: AbortController
) {
  const reactions = patientAllergy.reactionsUuid.map((reaction: any) => {
    return {
      reaction: {
        uuid: reaction.uuid
      }
    };
  });

  return openmrsFetch(
    `/ws/rest/v1/patient/${patientUuid}/allergy/${allergyUuid.allergyUuid}`,
    {
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: {
        allergen: {
          allergenType: patientAllergy.allergenType,
          codedAllergen: {
            uuid: patientAllergy.codedAllergenUuid
          }
        },
        severity: {
          uuid: patientAllergy.severityUuid
        },
        comment: patientAllergy.comment,
        reactions: reactions
      },
      signal: abortController.signal
    }
  );
}

export function deletePatientAllergy(
  patientUuid: string,
  allergyUuid: any,
  abortController: AbortController
) {
  return openmrsFetch(
    `/ws/rest/v1/patient/${patientUuid}/allergy/${allergyUuid.allergyUuid}`,
    {
      method: "DELETE",
      signal: abortController.signal
    }
  );
}
