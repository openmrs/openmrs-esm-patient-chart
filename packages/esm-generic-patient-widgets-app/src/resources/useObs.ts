import useSWR from 'swr';
import { openmrsFetch, fhirBaseUrl, useConfig, FHIRResource } from '@openmrs/esm-framework';

export const pageSize = 100;

export function useObs(patientUuid: string): UseObsResult {
  const { data } = useConfig();

  const { data: result, error, isValidating } = useSWR<{ data: ObsFetchResponse }, Error>(
    `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&code=` +
      data.join(',') +
      '&_summary=data&_sort=-date' +
      `&_count=${pageSize}
  `,
    openmrsFetch,
  );
  const observations = result?.data?.entry?.map((entry) => ({
    ...entry.resource,
    conceptUuid: entry.resource.code.coding.filter((c) => isUuid(c.code))[0]?.code
  })) ?? [];
  
  return {
    data: observations,
    isError: error,
    isLoading: !result && !error,
    isValidating,
  };
}

interface ObsFetchResponse {
  entry: Array<{
    resource: FHIRResource['resource'];
  }>;
  id: string;
  meta: {
    lastUpdated: string;
  };
  resourceType: string;
  total: number;
  type: string;
}

export interface UseObsResult {
  data: Array<ObsResult>,
  isError: Error,
  isLoading: boolean,
  isValidating: boolean
}

type ObsResult = FHIRResource['resource'] & {
  conceptUuid: string;
}



function isUuid(input: string) {
  return input.replace(/-/, "").length === 32;
}