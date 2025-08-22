import { find, map } from 'lodash-es';
import { BehaviorSubject } from 'rxjs';
import { type ExistingDoses, type ImmunizationFormState, type ImmunizationGrouped } from '../types';
import { type ImmunizationSequenceDefinition, type OpenmrsConcept } from '../types/fhir-immunization-domain';

export const immunizationFormSub = new BehaviorSubject<ImmunizationFormState | null>(null);

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
