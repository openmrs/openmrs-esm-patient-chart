import useSWR from 'swr';
import { openmrsFetch, fhirBaseUrl, useConfig, FHIRResource, FHIRCode } from '@openmrs/esm-framework';

export const pageSize = 100;

export function useObs(patientUuid: string, includeEncounters: boolean = false): UseObsResult {
  const { encounterTypes, data } = useConfig();
  const urlEncounterTypes: string = encounterTypes.length ? `&encounter.type=${encounterTypes.toString()}` : '';

  let url = `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&code=${data
    .map((d) => d.concept)
    .join(',')}&_summary=data&_sort=-date&_count=${pageSize}${urlEncounterTypes}`;

  if (includeEncounters) {
    url += '&_include=Observation:encounter';
  }

  const { data: result, error, isLoading, isValidating } = useSWR<{ data: ObsFetchResponse }, Error>(url, openmrsFetch);

  const encounters = includeEncounters ? getEncountersByResources(result?.data?.entry) : [];
  const observations = filterAndMapObservations(result?.data?.entry, encounters);

  return {
    data: observations,
    error: error,
    isLoading,
    isValidating,
  };
}

function filterAndMapObservations(entries, encounters): ObsResult[] {
  return (
    entries
      ?.filter((entry) => entry?.resource?.resourceType === 'Observation')
      ?.map((entry) => {
        const observation: ObsResult = {
          ...entry.resource,
          conceptUuid: entry.resource.code.coding.find((c) => isUuid(c.code))?.code,
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
        observation.encounter.name = encounters.find((e) => e.reference === entry.resource.encounter.reference)
          ?.display;

        return observation;
      }) || []
  );
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
  valueDateTime?: string;
};

function isUuid(input: string) {
  return input.length === 36;
}

function getEncountersByResources(resources) {
  return resources
    ?.filter((entry) => entry?.resource?.resourceType === 'Encounter')
    .map((entry) => ({
      reference: `Encounter/${entry.resource.id}`,
      display: entry.resource.type?.[0]?.coding?.[0]?.display || '--',
    }));
}
