import { type Diagnosis } from '@openmrs/esm-framework';

/**
 * Sorts diagnoses by rank (primary first) and collapses repeats of the same diagnosis
 * recorded across multiple encounters of a visit into a single entry, keeping the
 * highest-ranked occurrence. Coded diagnoses are keyed by concept UUID and non-coded
 * diagnoses by their text.
 */
export function dedupeDiagnoses(diagnoses: Array<Diagnosis>): Array<Diagnosis> {
  const seen = new Set<string>();
  return [...diagnoses]
    .sort((a, b) => a.rank - b.rank)
    .filter((diagnosis) => {
      const key = diagnosis.diagnosis?.coded?.uuid ?? diagnosis.diagnosis?.nonCoded;
      if (!key) {
        return true;
      }
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}
