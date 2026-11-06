import { FormSchema, Questions } from '../types';

/**
 * Rendering types supported by the form engine for numeric observations.
 */
const numericRenderingTypes = ['number', 'decimal', 'numeric'];

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
 * `conceptReferences` holds every reference the backend could resolve, keyed by the reference the
 * question uses, so a missing key means the reference is stale. Returning nothing for those is how a
 * stale question ends up being left out of the request instead of taking a whole batch down.
 */
export function resolveConceptUuid(formSchema: FormSchema, concept: string): string | undefined {
  const conceptReferences = formSchema.conceptReferences;

  if (conceptReferences) {
    return conceptReferences[concept]?.uuid ?? undefined;
  }

  return concept;
}
