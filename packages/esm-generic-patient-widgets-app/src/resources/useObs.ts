import useSWR from 'swr';
import { openmrsFetch, fhirBaseUrl, useConfig } from '@openmrs/esm-framework';

export interface UseObsResult {
  data: Array<ObsResult>;
  error: Error;
  isLoading: boolean;
  isValidating: boolean;
}

type ObsResult = fhir.Observation & {
  conceptUuid: string;
  dataType?: string;
  valueDateTime?: string;
  encounter?: {
    name?: string;
  };
};

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

  const { data: result, error, isLoading, isValidating } = useSWR<{ data: fhir.Bundle }, Error>(url, openmrsFetch);

  const encounters = includeEncounters ? getEncountersByResources(result?.data?.entry) : [];
  const observations = filterAndMapObservations(result?.data?.entry, encounters);

  return {
    data: observations,
    error: error,
    isLoading,
    isValidating,
  };
}

function filterAndMapObservations(
  entries: Array<fhir.BundleEntry>,
  encounters: Array<{ reference: string; display: string }>,
): ObsResult[] {
  return (
    entries
      ?.filter((entry) => entry?.resource?.resourceType === 'Observation')
      ?.map((entry) => {
        const resource = entry.resource as fhir.Observation;
        const observation: ObsResult = {
          ...resource,
          conceptUuid: resource.code.coding.find((c) => isUuid(c.code))?.code,
        };
        if (resource.hasOwnProperty('valueDateTime')) {
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

        observation.encounter.name = encounters.find(
          (e) =>
            e.reference === (resource as fhir.Observation & { encounter: { reference?: string } }).encounter.reference,
        )?.display;

        return observation;
      }) || []
  );
}

function getEncountersByResources(resources: Array<fhir.BundleEntry>) {
  return resources
    ?.filter((entry) => entry?.resource?.resourceType === 'Encounter')
    .map((entry: fhir.BundleEntry) => ({
      reference: `Encounter/${entry.resource.id}`,
      display: (entry.resource as fhir.Encounter).type?.[0]?.coding?.[0]?.display || '--',
    }));
}

function isUuid(input: string) {
  return input.length === 36;
}
