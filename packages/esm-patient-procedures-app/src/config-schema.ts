import { Type, validators } from '@openmrs/esm-framework';

export const conceptSourceTypes = ['Concept class', 'Concept set', 'Answer to', 'any'] as const;
export type ConceptSourceType = (typeof conceptSourceTypes)[number];

const sourceTypeDescription =
  'How the paired UUID filters concept search results: ' +
  '"Concept class" filters by concept class (REST `class`); ' +
  '"Concept set" returns set members (REST `memberOf`); ' +
  '"Answer to" returns answers to the given coded question (REST `answerTo`); ' +
  '"any" ignores the UUID and searches all concepts.';

export const configSchema = {
  overviewPageSize: {
    _type: Type.Number,
    _description: 'Number of rows per page in the procedures overview widget',
    _default: 5,
  },
  detailedViewPageSize: {
    _type: Type.Number,
    _description: 'Number of rows per page in the procedures detailed summary view',
    _default: 10,
  },
  procedureConceptUuid: {
    _type: Type.UUID,
    _description:
      'UUID used to constrain the procedure concept search. Its meaning is determined by `procedureConceptSourceType`.',
    _default: '8d490bf4-c2cc-11de-8d13-0010c6dffd0f',
  },
  procedureConceptSourceType: {
    _type: Type.String,
    _description: sourceTypeDescription,
    _default: 'Concept class',
    _validators: [validators.oneOf(conceptSourceTypes)],
  },
  bodySiteConceptUuid: {
    _type: Type.UUID,
    _description:
      'Value used to constrain the body-site concept search. Its meaning is determined by `bodySiteConceptSourceType`. For `Concept classs`, provide the concept class name.',
    _default: '8d491c7a-c2cc-11de-8d13-0010c6dffd0f', // Anatomy concept class
  },
  bodySiteConceptSourceType: {
    _type: Type.String,
    _description: sourceTypeDescription,
    _default: 'Concept class',
    _validators: [validators.oneOf(conceptSourceTypes)],
  },
  // TODO: Update the following value once the concept set is available for procedure status, currently using
  // https://app.openconceptlab.org/#/orgs/CIEL/sources/CIEL/concepts/167157/ (Medication dispense status)
  statusConceptUuid: {
    _type: Type.UUID,
    _description:
      'UUID used to constrain the procedure-status concept search. Its meaning is determined by `statusConceptSourceType`.',
    _default: '167157AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  statusConceptSourceType: {
    _type: Type.String,
    _description: sourceTypeDescription,
    _default: 'Concept set',
    _validators: [validators.oneOf(conceptSourceTypes)],
  },
  durationUnitConceptUuid: {
    _type: Type.UUID,
    _description:
      'UUID used to constrain the duration-unit concept search. Its meaning is determined by `durationUnitConceptSourceType`.',
    _default: '1732AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  durationUnitConceptSourceType: {
    _type: Type.String,
    _description: sourceTypeDescription,
    _default: 'Answer to',
    _validators: [validators.oneOf(conceptSourceTypes)],
  },
};

export interface ConfigObject {
  overviewPageSize: number;
  detailedViewPageSize: number;
  procedureConceptUuid: string;
  procedureConceptSourceType: ConceptSourceType;
  bodySiteConceptUuid: string;
  bodySiteConceptSourceType: ConceptSourceType;
  statusConceptUuid: string;
  statusConceptSourceType: ConceptSourceType;
  durationUnitConceptUuid: string;
  durationUnitConceptSourceType: ConceptSourceType;
}
