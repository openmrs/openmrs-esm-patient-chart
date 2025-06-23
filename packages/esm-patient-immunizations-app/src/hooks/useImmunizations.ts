import { fhirBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type FHIRImmunizationBundle } from '../types/fhir-immunization-domain';
import { mapFromFHIRImmunizationBundle } from '../immunizations/immunization-mapper';

export function useImmunizations(patientUuid: string) {
  const immunizationsUrl = `${fhirBaseUrl}/Immunization?patient=${patientUuid}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: FHIRImmunizationBundle }, Error>(
    immunizationsUrl,
    openmrsFetch,
  );
  const existingImmunizations = data ? mapFromFHIRImmunizationBundle(data.data) : null;

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
