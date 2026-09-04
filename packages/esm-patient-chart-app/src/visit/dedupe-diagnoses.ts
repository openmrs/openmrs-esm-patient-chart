import { type Diagnosis } from '@openmrs/esm-framework';

/**
 * A display-level aggregate of one diagnosis (keyed by concept UUID, or exact text for
 * non-coded diagnoses) across the encounters of a visit. The `uuid`, `display`, and
 * `diagnosis` reference come from one contributing encounter diagnosis so the entry has
 * a stable key, but `rank` and `certainty` are aggregated across all duplicates and may
 * not match that record. It must not be treated as an encounter diagnosis.
 */
export interface DedupedDiagnosis {
  uuid: string;
  display?: string;
  diagnosis?: Diagnosis['diagnosis'];
  rank?: number;
  // Deliberately `string`, not the CONFIRMED/PROVISIONAL union: this is a display-level
  // passthrough of whatever other writers stored, which may lie outside the known enum.
  certainty?: string;
}

/**
 * Collapses repeats of the same diagnosis recorded across multiple encounters of a visit
 * into a single entry and sorts the result by rank (primary first). Duplicates are merged
 * with: rank = the minimum across duplicates (primary if primary in any encounter), and
 * certainty = the strongest across duplicates (CONFIRMED if confirmed in any encounter).
 * Both rules are independent of encounter order.
 */
export function dedupeDiagnoses(diagnoses: Array<Diagnosis>): Array<DedupedDiagnosis> {
  const merged = new Map<string, DedupedDiagnosis>();
  const result: Array<DedupedDiagnosis> = [];

  for (const { uuid, display, diagnosis, rank, certainty } of diagnoses) {
    const key = diagnosis?.coded?.uuid ?? diagnosis?.nonCoded;
    const existing = key ? merged.get(key) : undefined;

    if (!existing) {
      const entry: DedupedDiagnosis = { uuid, display, diagnosis, rank, certainty };
      if (key) {
        merged.set(key, entry);
      }
      result.push(entry);
    } else {
      existing.rank = minRank(existing.rank, rank);
      existing.certainty =
        existing.certainty === 'CONFIRMED' || certainty === 'CONFIRMED' ? 'CONFIRMED' : existing.certainty ?? certainty;
    }
  }

  return result.sort((a, b) => (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER));
}

function minRank(a: number | undefined, b: number | undefined): number | undefined {
  if (a == null) {
    return b;
  }
  if (b == null) {
    return a;
  }
  return Math.min(a, b);
}
