import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { type FormSchema } from '@openmrs/esm-form-engine-lib';
import { formatDate, parseDate, formatDatetime, type Concept, age } from '@openmrs/esm-framework';
import { type Observation, type Encounter } from '../../encounter-list/types';
import { esmPatientChartSchema } from '../../config-schema';
import { type TFunction } from 'i18next';

type LaunchAction = 'add' | 'view' | 'edit' | 'embedded-view';

export function launchEncounterForm(
  form: FormSchema,
  action: LaunchAction = 'add',
  onFormSave: () => void,
  title?: string,
  encounterUuid?: string,
  intent: string = '*',
  workspaceWindowSize?: 'minimized' | 'maximized',
  patientUuid?: string,
) {
  launchPatientWorkspace('patient-form-entry-workspace', {
    workspaceTitle: form.name,
    mutateForm: onFormSave,
    formInfo: {
      encounterUuid,
      formUuid: form.name,
      patientUuid: patientUuid,
      visitTypeUuid: '',
      visitUuid: '',
      visitStartDatetime: '',
      visitStopDatetime: '',
      additionalProps: {
        mode: action === 'add' ? 'enter' : action,
        formSessionIntent: intent,
        openClinicalFormsWorkspaceOnFormClose: false,
      },
    },
  });
}

export function formatDateTime(dateString: string): string {
  const parsedDate = parseDate(dateString.includes('.') ? dateString.split('.')[0] : dateString);
  return formatDatetime(parsedDate);
}

export function obsArrayDateComparator(left: Observation, right: Observation): number {
  const leftDate = new Date(left.obsDatetime);
  const rightDate = new Date(right.obsDatetime);
  return rightDate.getTime() - leftDate.getTime();
}

export function findObs(encounter: Encounter, obsConcept: string): Observation | undefined {
  const allObs = encounter?.obs?.filter((observation) => observation.concept.uuid === obsConcept) || [];
  return !allObs ? undefined : allObs.length === 1 ? allObs[0] : allObs.sort(obsArrayDateComparator)[0];
}

export function getObsFromEncounters(encounters: Encounter, obsConcept: Concept) {
  const filteredEnc = encounters?.find((enc) => enc.obs.find((obs) => obs.concept.uuid === obsConcept));
  return getObsFromEncounter(filteredEnc, obsConcept);
}

export function resolveValueUsingMappings(encounter: Encounter, concept: string, mappings) {
  const obs = findObs(encounter, concept);
  for (const key in mappings) {
    if (typeof obs?.value === 'object' && 'uuid' in obs.value) {
      if (mappings[key] === obs.value.uuid) {
        return key;
      }
    }
  }
  return '--';
}

export function getConditionalConceptValue(encounter: any, conditionalConceptMappings, isDate) {
  const { trueConcept, nonTrueConcept, dependantConcept, conditionalConcept } = conditionalConceptMappings;
  const obsValue = findObs(encounter, dependantConcept)?.value;
  const dependantUuid = typeof obsValue === 'object' && 'uuid' in obsValue ? obsValue.uuid : null;
  const finalConcept = dependantUuid === conditionalConcept ? trueConcept : nonTrueConcept;
  return getObsFromEncounter(encounter, finalConcept, isDate);
}

export function getConceptFromMappings(encounter: Encounter, concepts) {
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

export function getObsFromEncounter(
  encounter: Encounter,
  obsConcept,
  isDate?: Boolean,
  isTrueFalseConcept?: Boolean,
  type?: string,
  fallbackConcepts?: Array<string>,
  secondaryConcept?: string,
  t?: TFunction,
) {
  let obs = findObs(encounter, obsConcept);

  if (!encounter || !obsConcept) {
    return '--';
  }

  // Not sure if these concepts are similar in all implementations,
  // There might be a better way to use a generic value
  if (isTrueFalseConcept) {
    if (typeof obs?.value === 'object') {
      if (
        (obs?.value?.uuid != esmPatientChartSchema.trueConceptUuid._default && obs?.value?.name?.name !== 'Unknown') ||
        obs?.value?.name?.name === 'FALSE'
      ) {
        return 'No';
      } else if (obs?.value?.uuid == esmPatientChartSchema.trueConceptUuid._default) {
        return 'Yes';
      } else {
        return obs?.value?.name?.name;
      }
    }
  }

  if (type === 'location') {
    return encounter.location.name;
  }

  if (type === 'provider') {
    return encounter.encounterProviders.map((p) => p.provider.name).join(' | ');
  }

  // TODO: This needs to be added later
  if (type === 'mothersName') {
    return;
  }

  if (type === 'visitType') {
    return encounter.encounterType.name;
  }

  // TODO: Need to get a better place for this
  if (type === 'ageAtHivTest') {
    return age(encounter.patient.birthDate, encounter.encounterDatetime);
  }

  if (secondaryConcept && typeof obs.value === 'object' && obs.value.names) {
    const primaryValue =
      obs.value.names.find((conceptName) => conceptName.conceptNameType === t('SHORT'))?.name || obs.value.name.name;
    if (primaryValue === t('Other non-coded')) {
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
      return typeof obs.value === 'string' ? formatDate(parseDate(obs.value), { mode: 'wide' }) : '--';
    }
  }

  if (typeof obs.value === 'object' && obs.value?.names) {
    return (
      obs.value?.names?.find((conceptName) => conceptName.conceptNameType === 'SHORT')?.name || obs.value.name.name
    );
  }
  return obs.value;
}

export const filter = (encounter: Encounter, formUuid: string) => encounter?.form?.uuid === formUuid;
