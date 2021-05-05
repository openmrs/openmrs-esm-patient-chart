import { openmrsFetch, openmrsObservableFetch, fhirBaseUrl } from '@openmrs/esm-framework';
import { map } from 'rxjs/operators';
import { AllergyData, AllergicReaction, FHIRAllergy } from '../types';

const ALLERGY_REACTION_CONCEPT = '162555AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

export function performPatientAllergySearch(patientIdentifier: string) {
  return openmrsObservableFetch<Array<Allergy>>(
    `${fhirBaseUrl}/AllergyIntolerance?patient.identifier=${patientIdentifier}`,
  ).pipe(
    map(({ data }) => data['entry']),
    map((entries) => entries?.map((entry) => entry?.resource) ?? []),
    map((data) => formatAllergies(data)),
    map((data) => data.sort((a, b) => (b.lastUpdated > a.lastUpdated ? 1 : -1))),
  );
}

export function fetchAllergyByUuid(allergyUuid: string) {
  return openmrsObservableFetch(`${fhirBaseUrl}/AllergyIntolerance/${allergyUuid}`).pipe(
    map(({ data }) => data),
    map((data: FHIRAllergy) => mapAllergyProperties(data)),
  );
}

function mapAllergyProperties(allergy: FHIRAllergy): Allergy {
  let manifestations: Array<string> = [];
  allergy?.reaction[0]?.manifestation?.map((coding) => manifestations.push(coding.coding[0]?.display));
  const formattedAllergy: Allergy = {
    id: allergy?.id,
    clinicalStatus: allergy?.clinicalStatus?.coding[0]?.display,
    criticality: allergy?.criticality,
    display: allergy?.code?.coding[0]?.display,
    recordedDate: allergy?.recordedDate,
    recordedBy: allergy?.recorder?.display,
    recorderType: allergy?.recorder?.type,
    note: allergy?.note?.[0]?.text,
    reactionToSubstance: allergy?.reaction[0]?.substance?.coding[1]?.display,
    reactionManifestations: manifestations,
    reactionSeverity: allergy?.reaction[0]?.severity,
    lastUpdated: allergy?.meta?.lastUpdated,
  };
  return formattedAllergy;
}

function formatAllergies(allergies: Array<FHIRAllergy>): Array<Allergy> {
  return allergies.map(mapAllergyProperties);
}

export function getPatientAllergyByPatientUuid(
  patientUuid: string,
  allergyUuid: any,
  abortController: AbortController,
) {
  return openmrsFetch<AllergyData>(`/ws/rest/v1/patient/${patientUuid}/allergy/${allergyUuid.allergyUuid}?v=full`, {
    signal: abortController.signal,
  });
}

export function getAllergyAllergenByConceptUuid(allergyUuid: string) {
  return openmrsObservableFetch(`/ws/rest/v1/concept/${allergyUuid}?v=full`).pipe(
    map(({ data }) => data['setMembers']),
  );
}

export function getAllergicReactions() {
  return openmrsObservableFetch<Array<AllergicReaction>>(`/ws/rest/v1/concept/${ALLERGY_REACTION_CONCEPT}?v=full`).pipe(
    map(({ data }) => data['setMembers']),
  );
}

export function savePatientAllergy(patientAllergy: any, patientUuid: string, abortController: AbortController) {
  const reactions = patientAllergy.reactionUuids.map((reaction: any) => {
    return {
      reaction: {
        uuid: reaction.uuid,
      },
    };
  });

  return openmrsFetch(`/ws/rest/v1/patient/${patientUuid}/allergy`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: {
      allergen: {
        allergenType: patientAllergy?.allergenType,
        codedAllergen: {
          uuid: patientAllergy?.codedAllergenUuid,
        },
      },
      severity: {
        uuid: patientAllergy?.severityUuid,
      },
      comment: patientAllergy?.comment,
      reactions: reactions,
    },
    signal: abortController.signal,
  });
}

export function updatePatientAllergy(
  patientAllergy: any,
  patientUuid: string,
  allergyUuid: any,
  abortController: AbortController,
) {
  const reactions = patientAllergy.reactionUuids.map((reaction: any) => {
    return {
      reaction: {
        uuid: reaction.uuid,
      },
    };
  });

  return openmrsFetch(`/ws/rest/v1/patient/${patientUuid}/allergy/${allergyUuid.allergyUuid}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: {
      allergen: {
        allergenType: patientAllergy.allergenType,
        codedAllergen: {
          uuid: patientAllergy.codedAllergenUuid,
        },
      },
      severity: {
        uuid: patientAllergy.severityUuid,
      },
      comment: patientAllergy.comment,
      reactions: reactions,
    },
    signal: abortController.signal,
  });
}

export function deletePatientAllergy(patientUuid: string, allergyUuid: any, abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/patient/${patientUuid}/allergy/${allergyUuid.allergyUuid}`, {
    method: 'DELETE',
    signal: abortController.signal,
  });
}

export type Allergy = {
  id: string;
  clinicalStatus: string;
  criticality: string;
  display: string;
  recordedDate: string;
  recordedBy: string;
  recorderType: string;
  note: string;
  reactionToSubstance: string;
  reactionManifestations: Array<string>;
  reactionSeverity: string;
  lastUpdated: string;
};
