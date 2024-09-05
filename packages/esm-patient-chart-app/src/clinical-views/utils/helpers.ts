import { age, formatDate, type OpenmrsResource, parseDate } from '@openmrs/esm-framework';
import { type TFunction } from 'i18next';
import { type EncounterTileColumn } from '../components/encounter-tile/encounter-tile.component';
import { esmPatientChartSchema } from '../../config-schema';

export interface Observation {
  uuid: string;
  concept: { uuid: string; name: string };
  value:
    | {
        uuid: string;
        name: {
          name: string;
          display: string;
        };
        names?: Array<{ uuid: string; name: string; conceptNameType: string }>;
      }
    | string;
  groupMembers?: Array<Observation>;
  obsDatetime: string;
}

export interface Encounter extends OpenmrsResource {
  encounterDatetime: Date;
  encounterType: { uuid: string; name: string };
  patient: {
    uuid: string;
    display: string;
    age: number;
    birthDate: string;
  };
  location: {
    uuid: string;
    display: string;
    name: string;
  };
  encounterProviders?: Array<{ encounterRole: string; provider: { uuid: string; name: string } }>;
  obs: Array<Observation>;
  form?: {
    uuid: string;
  };
  visit?: string;
}

export enum EncounterPropertyType {
  location = 'location',
  provider = 'provider',
  visitType = 'visitType',
  ageAtEncounter = 'ageAtEncounter',
}

export function getEncounterValues(encounter: Encounter, param: string, isDate?: Boolean) {
  if (isDate) return formatDate(encounter[param]);
  else return encounter[param] ?? '--';
}

export function obsArrayDateComparator(left: Observation, right: Observation) {
  return new Date(right.obsDatetime).getTime() - new Date(left.obsDatetime).getTime();
}

export function findObs(encounter: Encounter, obsConcept: string): Observation {
  const allObs = encounter?.obs?.filter((observation) => observation.concept.uuid === obsConcept) || [];
  return allObs?.length == 1 ? allObs[0] : allObs.sort(obsArrayDateComparator)[0];
}

export function getObsFromEncounters(encounters: Encounter, obsConcept: string) {
  const filteredEnc = encounters?.find((enc) => enc.obs.find((obs) => obs.concept.uuid === obsConcept));
  return getObsFromEncounter(filteredEnc, obsConcept);
}

export function resolveValueUsingMappings(encounter: Encounter, concept: string, mappings) {
  const obs = findObs(encounter, concept);
  for (const key in mappings) {
    if (typeof obs?.value === 'object' && 'uuid' in obs.value && mappings[key] === obs?.value?.uuid) {
      return key;
    }
  }
  return '--';
}

export function getConditionalConceptValue(encounter: Encounter, conditionalConceptMappings, isDate: Boolean) {
  const { trueConcept, nonTrueConcept, dependantConcept, conditionalConcept } = conditionalConceptMappings;
  const dependantValue = findObs(encounter, dependantConcept)?.value;
  const dependantUuid =
    typeof dependantValue === 'object' && 'uuid' in dependantValue ? dependantValue.uuid : undefined;
  const finalConcept = dependantUuid === conditionalConcept ? trueConcept : nonTrueConcept;
  return getObsFromEncounter(encounter, finalConcept, isDate);
}

export function getConceptFromMappings(encounter: Encounter, concepts: Array<string>) {
  for (const concept of concepts) {
    const obs = findObs(encounter, concept);
    if (obs && obs.value) {
      return concept;
    }
  }
  return null;
}

export function getMultipleObsFromEncounter(encounter: Encounter, obsConcepts: Array<string>) {
  let observations = [];
  obsConcepts.map((concept) => {
    const obs = getObsFromEncounter(encounter, concept);
    if (obs !== '--') {
      observations.push(obs);
    }
  });

  return observations.length ? observations.join(', ') : '--';
}

/**
 * Retrieves and formats an observation from an encounter based on the provided concept and various options.
 *
 * @param encounter - The encounter object from which observations will be extracted.
 * @param obsConcept - The main concept to search for in the encounter's observations.
 * @param isDate - Optional flag to indicate if the observation value should be treated as a date.
 * @param isTrueFalseConcept - Optional flag to check if the observation concept represents a true/false value.
 * @param type - Optional property type for filtering or fetching additional encounter properties.
 * @param fallbackConcepts - Optional list of alternative concepts to use if the primary concept is not found.
 * @param secondaryConcept - Optional secondary concept to check if the primary value matches a specific condition.
 * @param t - Optional translation function.
 * @returns The value of the observation, formatted appropriately, or '--' if not found or applicable.
 */
export function getObsFromEncounter(
  encounter: Encounter,
  obsConcept: string,
  isDate?: Boolean,
  isTrueFalseConcept?: Boolean,
  type?: EncounterPropertyType,
  fallbackConcepts?: Array<string>,
  secondaryConcept?: string,
  t?: TFunction,
) {
  let obs = findObs(encounter, obsConcept);
  if (!encounter || !obsConcept) {
    return '--';
  }

  if (isTrueFalseConcept) {
    if (typeof obs?.value === 'object') {
      return obs?.value?.name?.name;
    }
  }

  // handles things like location, provider, visit type, etc. that are not in the encounter
  if (type) {
    getEncounterProperty(encounter, type);
  }

  if (secondaryConcept && typeof obs.value === 'object' && obs.value.names) {
    const primaryValue = obs.value.name.display;
    if (primaryValue === esmPatientChartSchema.otherConceptUuid._default) {
      const secondaryObs = findObs(encounter, secondaryConcept);
      return secondaryObs ? secondaryObs.value : '--';
    }
  }

  if (!obs && fallbackConcepts?.length) {
    const concept = fallbackConcepts.find((c) => findObs(encounter, c) != null);
    obs = findObs(encounter, concept);
  }

  if (!obs) {
    return '--';
  }

  // format obs date or datetime appropriately
  if (isDate) {
    if (typeof obs.value === 'object' && obs.value?.names) {
      return formatDate(parseDate(obs.obsDatetime), { mode: 'wide' });
    } else if (typeof obs.value === 'string') {
      return formatDate(parseDate(obs.value), { mode: 'wide' });
    }
  }

  if (typeof obs.value === 'object' && obs.value?.names) {
    return obs.value?.name?.display;
  }
  return obs.value;
}

export const groupColumnsByEncounterType = (columns: EncounterTileColumn[]): Record<string, EncounterTileColumn[]> => {
  return columns.reduce((acc: Record<string, EncounterTileColumn[]>, column) => {
    if (!acc[column.encounterUuid]) {
      acc[column.encounterUuid] = [];
    }
    acc[column.encounterUuid].push(column);
    return acc;
  }, {});
};

export const getEncounterProperty = (encounter: Encounter, type: EncounterPropertyType) => {
  if (type === 'location') {
    return encounter.location.display;
  }

  if (type === 'provider') {
    return encounter.encounterProviders.map((p) => p.provider.name).join(' | ');
  }

  if (type === 'visitType') {
    return encounter.encounterType.name;
  }

  if (type === 'ageAtEncounter') {
    return age(encounter.patient.birthDate, encounter.encounterDatetime);
  }
};
