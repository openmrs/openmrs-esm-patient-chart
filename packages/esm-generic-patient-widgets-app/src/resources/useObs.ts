import useSWR from 'swr';
import { openmrsFetch, fhirBaseUrl, useConfig } from '@openmrs/esm-framework';
import { type ConfigObjectSwitchable } from '../config-schema-obs-switchable';
import { type ConfigObjectHorizontal } from '../config-schema-obs-horizontal';
import { useConcepts } from './useConcepts';

type CommonConfig = ConfigObjectSwitchable | ConfigObjectHorizontal;

export interface UseObsResult {
  data: {
    observations: Array<ObsResult>;
    concepts: Array<{ uuid: string; display: string; dataType: string }>;
    encounters: Array<{ reference: string; display: string; encounterTypeUuid: string }>;
  };
  error: Error;
  isLoading: boolean;
  isValidating: boolean;
  mutate: () => Promise<any>;
}

export type ObsResult = fhir.Observation & {
  conceptUuid: string;
  dataType?: string;
  valueDateTime?: string;
  encounter?: {
    name?: string;
    /**
     * Reference to the encounter resource, in the format `Encounter/{uuid}`
     */
    reference: string;
    encounterTypeUuid?: string;
  };
};

export const pageSize = 100;

/**
 * Fetches the observations for the concepts in the config for this widget.
 * For any concept that has neither label nor obs, the concept is fetched to
 * get the label.
 */
export function useObs(patientUuid: string): UseObsResult {
  const { encounterTypes, data } = useConfig<CommonConfig>();
  const urlEncounterTypes: string = encounterTypes.length ? `&encounter.type=${encounterTypes.toString()}` : '';

  // TODO: Make sorting respect oldestFirst/graphOldestFirst
  let url = `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&code=${data
    .map((d) => d.concept)
    .join(',')}&_summary=data&_include=Observation:encounter&_sort=-date&_count=${pageSize}${urlEncounterTypes}`;

  const {
    data: result,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<{ data: fhir.Bundle }, Error>(url, openmrsFetch);

  const { concepts } = useConcepts(data.map((d) => d.concept));

  const encounters = getEncountersFromResources(result?.data?.entry);
  const observations = filterAndMapObservations(result?.data?.entry, encounters, concepts);
  return {
    data: { observations, concepts, encounters },
    error: error,
    isLoading,
    isValidating,
    mutate,
  };
}

function filterAndMapObservations(
  entries: Array<fhir.BundleEntry>,
  encounters: Array<{ reference: string; display: string; encounterTypeUuid: string }>,
  concepts: Array<{ uuid: string; display: string; dataType: string }>,
): ObsResult[] {
  const conceptByUuid = Object.fromEntries(concepts.map((c) => [c.uuid, c]));
  return (
    entries
      ?.filter((entry) => entry?.resource?.resourceType === 'Observation')
      ?.map((entry) => {
        const resource = entry.resource as fhir.Observation;
        const observation: ObsResult = {
          ...resource,
          conceptUuid: resource.code.coding.find((c) => isUuid(c.code))?.code,
          dataType: conceptByUuid[resource.code.coding.find((c) => isUuid(c.code))?.code]?.dataType,
        };

        const encounter = encounters.find(
          (e) =>
            e.reference === (resource as fhir.Observation & { encounter: { reference?: string } }).encounter.reference,
        );

        observation.encounter.name = encounter?.display;
        observation.encounter.encounterTypeUuid = encounter?.encounterTypeUuid;

        return observation;
      }) || []
  );
}

function getEncountersFromResources(resources: Array<fhir.BundleEntry>) {
  return resources
    ?.filter((entry) => entry?.resource?.resourceType === 'Encounter')
    .map((entry: fhir.BundleEntry) => ({
      reference: `Encounter/${entry.resource.id}`,
      display: (entry.resource as fhir.Encounter).type?.[0]?.coding?.[0]?.display || '--',
      encounterTypeUuid: (entry.resource as fhir.Encounter).type?.[0]?.coding?.[0]?.code,
    }));
}

function isUuid(input: string) {
  return input.length === 36;
}
