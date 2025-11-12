import useSWR from 'swr';
import { openmrsFetch, fhirBaseUrl, useConfig } from '@openmrs/esm-framework';
import { type ConfigObjectSwitchable } from '../config-schema-obs-switchable';
import { type ConfigObjectHorizontal } from '../config-schema-obs-horizontal';
import { useConcepts } from './useConcepts';

type CommonConfig = ConfigObjectSwitchable | ConfigObjectHorizontal;

export interface UseObsResult {
  data: {
    observations: Array<ObsResult>;
    concepts: Array<{ uuid: string; display: string }>;
  };
  error: Error;
  isLoading: boolean;
  isValidating: boolean;
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
  };
};

export const pageSize = 100;

/**
 * Fetches the observations for the concepts in the config for this widget.
 * For any concept that has neither label nor obs, the concept is fetched to
 * get the label.
 */
export function useObs(patientUuid: string): UseObsResult {
  const { encounterTypes, data, showEncounterType } = useConfig<CommonConfig>();
  const urlEncounterTypes: string = encounterTypes.length ? `&encounter.type=${encounterTypes.toString()}` : '';

  // TODO: Make sorting respect oldestFirst/graphOldestFirst
  let url = `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&code=${data
    .map((d) => d.concept)
    .join(',')}&_summary=data&_sort=-date&_count=${pageSize}${urlEncounterTypes}`;

  if (showEncounterType) {
    url += '&_include=Observation:encounter';
  }

  const { data: result, error, isLoading, isValidating } = useSWR<{ data: fhir.Bundle }, Error>(url, openmrsFetch);

  const obsForConcept = Object.fromEntries(
    data.map((d) => [
      d.concept,
      result?.data?.entry?.find((e) => (e.resource as fhir.Observation).code.coding.find((c) => d.concept === c.code)),
    ]),
  );

  const conceptsNeedingLabel = data.filter((d) => result && !d.label && !obsForConcept[d.concept]);

  const { concepts: conceptsForLabels } = useConcepts(conceptsNeedingLabel.map((d) => d.concept));
  const concepts = data.map((d) => ({
    uuid: d.concept,
    display:
      d.label ||
      obsForConcept[d.concept]?.resource?.code?.text ||
      conceptsForLabels.find((c) => c.uuid === d.concept)?.display,
  }));

  const encounters = showEncounterType ? getEncountersByResources(result?.data?.entry) : [];
  const observations = filterAndMapObservations(result?.data?.entry, encounters);
  return {
    data: { observations, concepts },
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
