import { find, map } from 'lodash-es';
import dayjs from 'dayjs';
import { BehaviorSubject } from 'rxjs';
import { type ExistingDoses, type ImmunizationFormState, type ImmunizationGrouped } from '../types';
import { type ImmunizationSequenceDefinition } from '../types/fhir-immunization-domain';

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

/**
 * Converts a Date object to a date-only string format (YYYY-MM-DD)
 * without timezone conversion, suitable for FHIR date fields.
 *
 * This ensures the date value entered by the user is preserved exactly
 * as intended, preventing timezone-related date shifts (e.g., O3-4970).
 *
 * @param date - The Date object to format
 * @returns Date string in YYYY-MM-DD format (e.g., "2025-12-31")
 * @throws Error if invalid date provided
 *
 * @example
 * ```typescript
 * const date = new Date('2025-12-31');
 * toDateOnlyString(date); // Returns "2025-12-31"
 * ```
 */
export const toDateOnlyString = (date: Date): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date provided to toDateOnlyString');
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
