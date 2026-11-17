import { fhirBaseUrl, openmrsFetch, restBaseUrl, useFhirFetchAll, type OpenmrsResource } from '@openmrs/esm-framework';
import { type Allergy, type FHIRAllergy, type PatientAllergyPayload, type UseAllergies } from '../types';

export function useAllergies(patientUuid: string): UseAllergies {
  // The FHIR server pages its results (10 per page by default), so fetch every page.
  // Reading only the first page would leave allergies out of the chart and the drug order form.
  const allergiesUrl = patientUuid ? `${fhirBaseUrl}/AllergyIntolerance?patient=${patientUuid}` : null;

  const { data, error, isLoading, isValidating, mutate } = useFhirFetchAll<FHIRAllergy>(allergiesUrl);

  const formattedAllergies =
    data?.length > 0 ? data.map(mapAllergyProperties).sort((a, b) => (b.lastUpdated > a.lastUpdated ? 1 : -1)) : null;

  return {
    allergies: data ? formattedAllergies : null,
    error,
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
