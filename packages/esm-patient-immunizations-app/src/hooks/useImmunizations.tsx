import { fhirBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type FHIRImmunizationBundle } from '../types/fhir-immunization-domain';
import { mapFromFHIRImmunizationBundle } from '../immunizations/immunization-mapper';

export function useImmunizations(patientUuid: string) {
  const immunizationsUrl = `${fhirBaseUrl}/Immunization?patient=${patientUuid}`;

  const { data, error, isLoading, isValidating } = useSWR<{ data: FHIRImmunizationBundle }, Error>(
    immunizationsUrl,
    openmrsFetch,
  );
  const existingImmunizations = data ? mapFromFHIRImmunizationBundle(data.data) : null;

  return {
    data: data ? existingImmunizations : null,
    isError: error,
    isLoading,
    isValidating,
  };
}
