import useSWR from 'swr';
import { openmrsFetch, fhirBaseUrl, useConfig, FHIRResource, FHIRCode } from '@openmrs/esm-framework';

export const pageSize = 100;

export function useObs(patientUuid: string): UseObsResult {
  const { encounterTypes, data } = useConfig();

  const urlEncounterTypes: string = encounterTypes.length ? `&encounter.type=${encounterTypes.toString()}` : '';

  const {
    data: result,
    error,
    isValidating,
  } = useSWR<{ data: ObsFetchResponse }, Error>(
    `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&code=` +
      data.map((d) => d.concept).join(',') +
      '&_summary=data&_sort=-date' +
      `&_count=${pageSize}` +
      urlEncounterTypes,
    openmrsFetch,
  );

  const observations =
    result?.data?.entry?.map((entry) => {
      const observation: ObsResult = {
        ...entry.resource,
        conceptUuid: entry.resource.code.coding.filter((c) => isUuid(c.code))[0]?.code,
      };

      if (entry.resource.hasOwnProperty('valueDateTime')) {
        observation.dataType = 'DateTime';
      }

      if (entry.resource.hasOwnProperty('valueString')) {
        observation.dataType = 'Text';
      }

      if (entry.resource.hasOwnProperty('valueQuantity')) {
        observation.dataType = 'Number';
      }

      if (entry.resource.hasOwnProperty('valueCodeableConcept')) {
        observation.dataType = 'Coded';
      }

      return observation;
    }) ?? [];

  return {
    data: observations,
    error: error,
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
  data: Array<ObsResult>;
  error: Error;
  isLoading: boolean;
  isValidating: boolean;
}

type ObsResult = FHIRResource['resource'] & {
  conceptUuid: string;
  dataType?: string;
};

function isUuid(input: string) {
  return input.length === 36;
}
