import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';

export function useVitalsConceptMetadata() {
  const customRepresentation =
    'custom:(setMembers:(uuid,display,hiNormal,hiAbsolute,hiCritical,lowNormal,lowAbsolute,lowCritical,units))';

  const { data, error } = useSWR<{ data: VitalsConceptMetadataResponse }, Error>(
    `/ws/rest/v1/concept/?q=VITALS SIGNS&v=${customRepresentation}`,
    openmrsFetch,
  );

  const conceptMetadata = data?.data?.results[0]?.setMembers;
  const conceptUnits = conceptMetadata?.length ? conceptMetadata.map((conceptUnit) => conceptUnit.units) : null;

  return {
    data: conceptMetadata?.length ? { conceptUnits, conceptMetadata } : null,
    isError: error,
    isLoading: !data && !error,
  };
}

export const withUnit = (label: string, unit: string | null | undefined) => {
  return `${label} ${unit ? `(${unit})` : ''}`;
};

export interface ConceptMetadata {
  uuid: string;
  display: string;
  hiNormal: number | string | null;
  hiAbsolute: number | string | null;
  hiCritical: number | string | null;
  lowNormal: number | string | null;
  lowAbsolute: number | string | null;
  lowCritical: number | string | null;
  units: string | null;
}

interface VitalsConceptMetadataResponse {
  results: Array<{
    setMembers: Array<ConceptMetadata>;
  }>;
}
