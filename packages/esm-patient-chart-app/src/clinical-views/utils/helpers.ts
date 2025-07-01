import { age, formatDate, launchWorkspace, parseDate, type Visit } from '@openmrs/esm-framework';
import type {
  ConfigConcepts,
  Encounter,
  EncounterPropertyType,
  EncounterTileColumn,
  Form,
  GetObsFromEncounterParams,
  Observation,
} from '../types';

type LaunchAction = 'add' | 'view' | 'edit' | 'embedded-view';

export function launchEncounterForm(
  form: Form,
  visit: Visit,
  action: LaunchAction = 'add',
  onFormSave: () => void,
  encounterUuid?: string,
  intent: string = '*',
  patientUuid?: string,
) {
  launchWorkspace('patient-form-entry-workspace', {
    workspaceTitle: form?.name,
    mutateForm: onFormSave,
    formInfo: {
      encounterUuid,
      formUuid: form?.uuid,
      patientUuid: patientUuid,
      visit: visit,
      additionalProps: {
        mode: action === 'add' ? 'enter' : action,
        formSessionIntent: intent,
        openClinicalFormsWorkspaceOnFormClose: false,
      },
    },
  });
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

export function getObsFromEncounters(encounters: Encounter, obsConcept: string, config: ConfigConcepts) {
  const filteredEnc = encounters?.find((enc) => enc.obs.find((obs) => obs.concept.uuid === obsConcept));
  return getObsFromEncounter({ encounter: filteredEnc, obsConcept: obsConcept, config: config });
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

export function getConditionalConceptValue(
  encounter: Encounter,
  conditionalConceptMappings,
  isDate: boolean,
  config: ConfigConcepts,
) {
  const { trueConcept, nonTrueConcept, dependantConcept, conditionalConcept } = conditionalConceptMappings;
  const dependantValue = findObs(encounter, dependantConcept)?.value;
  const dependantUuid =
    typeof dependantValue === 'object' && 'uuid' in dependantValue ? dependantValue.uuid : undefined;
  const finalConcept = dependantUuid === conditionalConcept ? trueConcept : nonTrueConcept;
  return getObsFromEncounter({
    encounter: encounter,
    obsConcept: finalConcept,
    isDate: isDate,
    isTrueFalseConcept: false,
    config: config,
  });
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

export function getMultipleObsFromEncounter(encounter: Encounter, obsConcepts: Array<string>, config: ConfigConcepts) {
  let observations = [];
  obsConcepts.map((concept) => {
    const obs = getObsFromEncounter({ encounter: encounter, obsConcept: concept, config: config });
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
export function getObsFromEncounter({
  encounter,
  obsConcept,
  isDate = false,
  isTrueFalseConcept = false,
  type,
  fallbackConcepts = [],
  secondaryConcept,
  config,
}: GetObsFromEncounterParams) {
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
    if (primaryValue === config.otherConceptUuid) {
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

  // format format obs date or datetime based on the obs value's type
  if (isDate) {
    if (typeof obs.value === 'object' && obs.value?.names) {
      return formatDate(parseDate(obs.obsDatetime), { mode: 'wide' });
    } else if (typeof obs.value === 'string') {
      return formatDate(parseDate(obs.value), { mode: 'wide' });
    }
  }

  if (typeof obs.value === 'object' && obs.value?.name) {
    return obs.value?.name?.display;
  }
  return obs.value;
}

export const groupColumnsByEncounterType = (columns: EncounterTileColumn[]): Record<string, EncounterTileColumn[]> => {
  return columns.reduce((acc: Record<string, EncounterTileColumn[]>, column) => {
    if (!acc[column.encounterTypeUuid]) {
      acc[column.encounterTypeUuid] = [];
    }
    acc[column.encounterTypeUuid].push(column);
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

export const filter = (encounter: Encounter, formUuid: string) => encounter?.form?.uuid === formUuid;
