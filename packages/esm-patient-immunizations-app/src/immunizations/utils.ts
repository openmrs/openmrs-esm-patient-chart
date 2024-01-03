import map from 'lodash-es/map';
import find from 'lodash-es/find';
import { ExistingDoses, ImmunizationFormState, ImmunizationGrouped } from '../types';
import { ImmunizationSequenceDefinition, OpenmrsConcept } from '../types/fhir-immunization-domain';
import { BehaviorSubject } from 'rxjs';

export const immunizationFormSub = new BehaviorSubject<ImmunizationFormState | null>(null);

export const findConfiguredSequences = (
  configuredSequences: Array<ImmunizationSequenceDefinition>,
  immunizationsConceptSet: OpenmrsConcept,
) => {
  const immunizationConcepts: Array<OpenmrsConcept> = immunizationsConceptSet?.answers;
  return map(immunizationConcepts, (immunizationConcept) => {
    const immunizationDataFromConfig: ImmunizationGrouped = {
      vaccineName: immunizationConcept.display,
      vaccineUuid: immunizationConcept.uuid,
      existingDoses: [],
    };

    const matchingSequenceDef = find(
      configuredSequences,
      (sequencesDef) => sequencesDef.vaccineConceptUuid === immunizationConcept.uuid,
    );
    immunizationDataFromConfig.sequences = matchingSequenceDef?.sequences;
    return immunizationDataFromConfig;
  });
};

export const findExistingDoses = (
  configuredImmunizations: Array<ImmunizationGrouped>,
  existingImmunizationsForPatient: Array<ImmunizationGrouped>,
): Array<ImmunizationGrouped> => {
  return map(configuredImmunizations, (immunizationFromConfig) => {
    const matchingExistingImmunization = find(
      existingImmunizationsForPatient,
      (existingImmunization) => existingImmunization.vaccineUuid === immunizationFromConfig.vaccineUuid,
    );
    if (matchingExistingImmunization) {
      immunizationFromConfig.existingDoses = matchingExistingImmunization.existingDoses;
    }
    return immunizationFromConfig;
  }).filter((immunizationFromConfig) => immunizationFromConfig.existingDoses?.length);
};

export const linkConfiguredSequences = (
  existingImmunizations: Array<ImmunizationGrouped>,
  configuredSequences: Array<ImmunizationSequenceDefinition>,
): Array<ImmunizationGrouped> => {
  return map(existingImmunizations, (immunization) => {
    const matchingSequenceDef = find(
      configuredSequences,
      (sequencesDef) => sequencesDef.vaccineConceptUuid === immunization.vaccineUuid,
    );
    immunization.sequences = matchingSequenceDef?.sequences || [];
    return immunization;
  });
};

export const latestFirst = (a: ExistingDoses, b: ExistingDoses) =>
  new Date(b.occurrenceDateTime).getTime() - new Date(a.occurrenceDateTime).getTime();
