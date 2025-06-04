import useSWR from 'swr';
import { map } from 'rxjs/operators';
import capitalize from 'lodash-es/capitalize';
import {
  fhirBaseUrl,
  openmrsFetch,
  openmrsObservableFetch,
  restBaseUrl,
  type OpenmrsResource,
} from '@openmrs/esm-framework';
import {
  type FHIRAllergy,
  type FHIRAllergyResponse,
  type Allergy,
  type UseAllergies,
  type PatientAllergyPayload,
} from '../types';

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
    error: error,
    isLoading,
    isValidating,
    mutate,
  };
}

function mapAllergyProperties(allergy: FHIRAllergy): Allergy {
  const manifestations = allergy?.reaction[0]?.manifestation?.map((coding) => coding?.text);
  return {
    id: allergy?.id,
    clinicalStatus: allergy?.clinicalStatus?.coding[0]?.display,
    criticality: allergy?.criticality,
    display: allergy?.code?.text ?? allergy?.code?.coding[0]?.display,
    recordedDate: allergy?.recordedDate,
    recordedBy: allergy?.recorder?.display,
    recorderType: allergy?.recorder?.type,
    note: allergy?.note?.[0]?.text,
    reactionToSubstance: allergy?.reaction[0]?.substance?.text,
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

export function saveAllergy(
  patientAllergy: PatientAllergyPayload,
  patientUuid: string,
  abortController: AbortController,
) {
  const reactions = patientAllergy.reactionUuids.map((reaction: OpenmrsResource) => {
    return {
      reaction: {
        uuid: reaction.uuid,
      },
    };
  });

  return openmrsFetch(`${restBaseUrl}/patient/${patientUuid}/allergy`, {
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

export function deletePatientAllergy(patientUuid: string, allergyUuid: string, abortController: AbortController) {
  return openmrsFetch(`${restBaseUrl}/patient/${patientUuid}/allergy/${allergyUuid}`, {
    method: 'DELETE',
    signal: abortController.signal,
  });
}
