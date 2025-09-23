import useSWRImmutable from 'swr/immutable';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

interface ConceptResponse {
  uuid: string;
  display: string;
  units?: string;
}

export function useConceptUnits(conceptUuid: string) {
  const customRepresentation = 'custom:(uuid,display,units)';
  const apiUrl = conceptUuid ? `${restBaseUrl}/concept/${conceptUuid}?v=${customRepresentation}` : null;

  const { data, error, isLoading } = useSWRImmutable<{ data: ConceptResponse }, Error>(
    apiUrl,
    openmrsFetch,
  );

  return {
    units: data?.data?.units || '',
    error,
    isLoading,
  };
}

export const withUnit = (value: string | number, unit: string | null | undefined) => {
  if (!value || value === '--') return value;
  return unit ? `${value} ${unit}` : value;
};