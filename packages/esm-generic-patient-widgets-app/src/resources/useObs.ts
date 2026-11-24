import { fhirBaseUrl, useConfig, useFhirFetchAll } from '@openmrs/esm-framework';
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

  const { data: resources, error, isLoading, isValidating, mutate } = useFhirFetchAll<fhir.Resource>(url);

  const { concepts } = useConcepts(data.map((d) => d.concept));

  const encounters = getEncountersFromResources(resources);
  const observations = filterAndMapObservations(resources, encounters, concepts);
  return {
    data: { observations, concepts, encounters },
    error: error,
    isLoading,
    isValidating,
    mutate,
  };
}

function filterAndMapObservations(
  resources: Array<fhir.Resource>,
  encounters: Array<{ reference: string; display: string; encounterTypeUuid: string }>,
  concepts: Array<{ uuid: string; display: string; dataType: string }>,
): ObsResult[] {
  const conceptByUuid = Object.fromEntries(concepts.map((c) => [c.uuid, c]));
  return (
    resources
      ?.filter((resource): resource is fhir.Observation => resource?.resourceType === 'Observation')
      .map((resource) => {
        const observation: ObsResult = {
          ...resource,
          conceptUuid: resource.code.coding.find((c) => isUuid(c.code))?.code,
          dataType: conceptByUuid[resource.code.coding.find((c) => isUuid(c.code))?.code]?.dataType,
        };

        // Observation.encounter is optional in FHIR; obs created without an
        // encounter (e.g. via REST integrations) simply don't have one.
        const encounterReference = (resource as fhir.Observation & { encounter?: { reference?: string } }).encounter
          ?.reference;
        if (encounterReference) {
          const encounter = encounters.find((e) => e.reference === encounterReference);
          observation.encounter = {
            reference: encounterReference,
            name: encounter?.display,
            encounterTypeUuid: encounter?.encounterTypeUuid,
          };
        }

        return observation;
      }) || []
  );
}

function getEncountersFromResources(resources: Array<fhir.Resource> = []) {
  const encounters = resources.filter((resource): resource is fhir.Encounter => resource?.resourceType === 'Encounter');
  // The same encounter can be included alongside observations on several pages.
  const uniqueEncounters = new Map(encounters.map((encounter) => [encounter.id, encounter]));
  return Array.from(uniqueEncounters.values()).map((encounter) => ({
    reference: `Encounter/${encounter.id}`,
    display: encounter.type?.[0]?.coding?.[0]?.display || '--',
    encounterTypeUuid: encounter.type?.[0]?.coding?.[0]?.code,
  }));
}

function isUuid(input: string) {
  return input.length === 36;
}
