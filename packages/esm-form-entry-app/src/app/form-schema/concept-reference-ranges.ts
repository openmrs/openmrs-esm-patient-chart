import { ConceptReferenceRange, FormSchema, Questions } from '../types';

/**
 * The form engine only derives numeric bounds from `questionOptions.min` and `questionOptions.max`,
 * and only does so for these two rendering types.
 */
const numericRenderingTypes = ['number', 'decimal'];

/**
 * Collects the concept of every numeric question in the given schema. These are the concepts for
 * which reference ranges can be applied.
 *
 * The concepts are resolved and deduplicated so that the request stays as small as it can be:
 * questions whose concept reference is known not to resolve are left out entirely, and two
 * questions sharing a concept only account for one entry.
 */
export function getNumericQuestionConcepts(formSchema: FormSchema): Array<string> {
  const concepts = getNumericQuestions(formSchema)
    .map((question) => resolveConceptUuid(formSchema, question.questionOptions.concept))
    .filter((concept) => Boolean(concept));

  return Array.from(new Set(concepts));
}

/**
 * Narrows the bounds of every numeric question to the concept reference range which applies to the
 * current patient, so that values the backend would reject are caught during data entry.
 *
 * Only the absolute bounds are used, mirroring how the backend validates observations. A bound
 * defined by the schema is never widened: whichever of the two bounds is stricter wins.
 *
 * @param formSchema The schema to be modified in place.
 * @param referenceRanges The reference ranges which apply to the patient, keyed by concept UUID.
 */
export function applyConceptReferenceRanges(
  formSchema: FormSchema,
  referenceRanges: Map<string, ConceptReferenceRange> | undefined,
) {
  if (!referenceRanges?.size) {
    return;
  }

  for (const question of getNumericQuestions(formSchema)) {
    const concept = resolveConceptUuid(formSchema, question.questionOptions.concept);
    const referenceRange = concept ? referenceRanges.get(concept) : undefined;

    if (!referenceRange) {
      continue;
    }

    const min = strictestBound(toNumber(question.questionOptions.min), toNumber(referenceRange.lowAbsolute), Math.max);
    const max = strictestBound(toNumber(question.questionOptions.max), toNumber(referenceRange.hiAbsolute), Math.min);

    // The form engine only wires up the min and max validators when both bounds are set, so there
    // is nothing to apply as long as one of them is missing.
    if (min === undefined || max === undefined) {
      continue;
    }

    question.questionOptions.min = String(min);
    question.questionOptions.max = String(max);
  }
}

function getNumericQuestions(formSchema: FormSchema): Array<Questions> {
  const numericQuestions: Array<Questions> = [];

  const collect = (questions: Array<Questions> = []) => {
    for (const question of questions) {
      if (numericRenderingTypes.includes(question.questionOptions?.rendering) && question.questionOptions.concept) {
        numericQuestions.push(question);
      }

      collect(question.questions);
    }
  };

  for (const page of formSchema?.pages ?? []) {
    for (const section of page?.sections ?? []) {
      collect(section?.questions);
    }
  }

  return numericQuestions;
}

/**
 * Questions can refer to their concept either by UUID or by a concept reference such as `CIEL:5089`,
 * while the reference ranges are always keyed by UUID.
 *
 * Returns nothing for a reference the schema itself already tells us does not resolve, which is how
 * a stale question ends up being left out of the request instead of taking a whole batch down.
 */
function resolveConceptUuid(formSchema: FormSchema, concept: string): string | undefined {
  const conceptReferences = formSchema.conceptReferences;

  if (conceptReferences && concept in conceptReferences) {
    return conceptReferences[concept]?.uuid ?? undefined;
  }

  return concept;
}

function toNumber(value: string | number | null | undefined): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function strictestBound(
  schemaBound: number | undefined,
  referenceRangeBound: number | undefined,
  pickStrictest: (a: number, b: number) => number,
): number | undefined {
  if (schemaBound === undefined) {
    return referenceRangeBound;
  }

  if (referenceRangeBound === undefined) {
    return schemaBound;
  }

  return pickStrictest(schemaBound, referenceRangeBound);
}
