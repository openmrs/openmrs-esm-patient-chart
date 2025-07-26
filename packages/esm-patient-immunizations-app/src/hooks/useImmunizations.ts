import { fhirBaseUrl, openmrsFetch, useFhirFetchAll } from '@openmrs/esm-framework';
import { type FHIRImmunizationResource } from '../types/fhir-immunization-domain';
import { mapFromFHIRImmunizationBundle } from '../immunizations/immunization-mapper';

export function useImmunizations(patientUuid: string) {
  const immunizationsUrl = `${fhirBaseUrl}/Immunization?patient=${patientUuid}`;

  const { data, error, isLoading, isValidating, mutate } = useFhirFetchAll(immunizationsUrl);

  const existingImmunizations = data ? mapFromFHIRImmunizationBundle(data as FHIRImmunizationResource[]) : [];

  return {
    data: existingImmunizations,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

// Deletes a single FHIR Immunization resource (i.e., a single dose/event)
export async function deletePatientImmunization(immunizationUuid: string) {
  const controller = new AbortController();
  const url = `${fhirBaseUrl}/Immunization/${immunizationUuid}`;

  await openmrsFetch(url, {
    method: 'DELETE',
    signal: controller.signal,
  });
}
