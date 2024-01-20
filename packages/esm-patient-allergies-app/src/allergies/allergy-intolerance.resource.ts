import useSWR from 'swr';
import { map } from 'rxjs/operators';
import { fhirBaseUrl, openmrsFetch, openmrsObservableFetch } from '@openmrs/esm-framework';
import { type FHIRAllergy, type FHIRAllergyResponse, type ReactionSeverity } from '../types';

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
  reactionSeverity: ReactionSeverity;
  lastUpdated: string;
};

type UseAllergies = {
  allergies: Array<Allergy>;
  error: Error | null;
  isLoading: boolean;
  isValidating: boolean;
  mutate: () => void;
};

export function useAllergies(patientUuid: string): UseAllergies {
  const allergiesUrl = `${fhirBaseUrl}/AllergyIntolerance?patient=${patientUuid}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: FHIRAllergyResponse }, Error>(
    patientUuid ? allergiesUrl : null,
    openmrsFetch,
  );

  const formattedAllergies =
    data?.data?.total > 0
      ? data?.data.entry
          .map((entry) => entry.resource ?? [])
          .map(mapAllergyProperties)
          .sort((a, b) => (b.lastUpdated > a.lastUpdated ? 1 : -1))
      : null;

  return {
    allergies: data ? formattedAllergies : null,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

function mapAllergyProperties(allergy: FHIRAllergy): Allergy {
  const manifestations = allergy?.reaction[0]?.manifestation?.map((coding) => coding.coding[0]?.display);
  return {
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
}

export function fetchAllergyByUuid(allergyUuid: string) {
  return openmrsObservableFetch<FHIRAllergy>(`${fhirBaseUrl}/AllergyIntolerance/${allergyUuid}`).pipe(
    map(({ data }) => mapAllergyProperties(data)),
  );
}

export function saveAllergy(patientAllergy: any, patientUuid: string, abortController: AbortController) {
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
