import dayjs from 'dayjs';
import { formatDate, parseDate } from '@openmrs/esm-framework';

export function getEncounterValues(encounter, param: string, isDate?: Boolean) {
  if (isDate) return dayjs(encounter[param]).format('DD-MMM-YYYY');
  else return encounter[param] ? encounter[param] : '--';
}

export function formatDateTime(dateString: string): any {
  const format = 'YYYY-MM-DDTHH:mm:ss';
  if (dateString.includes('.')) {
    dateString = dateString.split('.')[0];
  }
  return dayjs(dateString, format, true).toDate();
}

export function obsArrayDateComparator(left, right) {
  return formatDateTime(right.obsDatetime) - formatDateTime(left.obsDatetime);
}

export function findObs(encounter, obsConcept): Record<string, any> {
  const allObs = encounter?.obs?.filter((observation) => observation.concept.uuid === obsConcept) || [];
  return allObs?.length == 1 ? allObs[0] : allObs?.sort(obsArrayDateComparator)[0];
}

export function getObsFromEncounters(encounters, obsConcept) {
  const filteredEnc = encounters?.find((enc) => enc.obs.find((obs) => obs.concept.uuid === obsConcept));
  return getObsFromEncounter(filteredEnc, obsConcept);
}

export function resolveValueUsingMappings(encounter, concept, mappings) {
  const obs = findObs(encounter, concept);
  for (const key in mappings) {
    if (mappings[key] === obs?.value?.uuid) {
      return key;
    }
  }
  return '--';
}

export function getConditionalConceptValue(encounter: any, conditionalConceptMappings, isDate) {
  const { trueConcept, nonTrueConcept, dependantConcept, conditionalConcept } = conditionalConceptMappings;
  const dependantUuid = findObs(encounter, dependantConcept)?.value?.uuid;
  const finalConcept = dependantUuid === conditionalConcept ? trueConcept : nonTrueConcept;
  return getObsFromEncounter(encounter, finalConcept, isDate);
}

export function getConceptFromMappings(encounter, concepts) {
  for (const concept of concepts) {
    const obs = findObs(encounter, concept);
    if (obs && obs.value) {
      return concept;
    }
  }
  return null;
}

export function getMultipleObsFromEncounter(encounter, obsConcepts: Array<string>) {
  let observations = [];
  obsConcepts.map((concept) => {
    const obs = getObsFromEncounter(encounter, concept);
    if (obs !== '--') {
      observations.push(obs);
    }
  });

  return observations.length ? observations.join(', ') : '--';
}

export function getObsFromEncounter(
  encounter,
  obsConcept,
  isDate?: Boolean,
  isTrueFalseConcept?: Boolean,
  type?: string,
  fallbackConcepts?: Array<string>,
  secondaryConcept?: string,
) {
  let obs = findObs(encounter, obsConcept);

  if (!encounter || !obsConcept) {
    return '--';
  }

  if (isTrueFalseConcept) {
    if (
      (obs?.value?.uuid != 'cf82933b-3f3f-45e7-a5ab-5d31aaee3da3' && obs?.value?.name?.name !== 'Unknown') ||
      obs?.value?.name?.name === 'FALSE'
    ) {
      return 'No';
    } else if (obs?.value?.uuid == 'cf82933b-3f3f-45e7-a5ab-5d31aaee3da3') {
      return 'Yes';
    } else {
      return obs?.value?.name?.name;
    }
  }

  if (type === 'location') {
    return encounter.location.name;
  }

  if (type === 'provider') {
    return encounter.encounterProviders.map((p) => p.provider.name).join(' | ');
  }

  if (type === 'visitType') {
    return encounter.encounterType.name;
  }

  if (type === 'ageAtHivTest') {
    return encounter.patient.age;
  }

  if (secondaryConcept && typeof obs.value === 'object' && obs.value.names) {
    const primaryValue =
      obs.value.names.find((conceptName) => conceptName.conceptNameType === 'SHORT')?.name || obs.value.name.name;
    if (primaryValue === 'Other non-coded') {
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

  if (isDate) {
    if (typeof obs.value === 'object' && obs.value?.names) {
      return formatDate(parseDate(obs.obsDatetime), { mode: 'wide' });
    } else {
      return formatDate(parseDate(obs.value), { mode: 'wide' });
    }
  }

  if (typeof obs.value === 'object' && obs.value?.names) {
    return (
      obs.value?.names?.find((conceptName) => conceptName.conceptNameType === 'SHORT')?.name || obs.value.name.name
    );
  }
  return obs.value;
}
