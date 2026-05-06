import { Type, validators } from '@openmrs/esm-framework';

export const conceptSourceTypes = ['conceptClass', 'conceptSet', 'answerTo', 'any'] as const;
export type ConceptSourceType = (typeof conceptSourceTypes)[number];

const sourceTypeDescription =
  'How the paired UUID filters concept search results: ' +
  '"conceptClass" filters by concept class (REST `class`); ' +
  '"conceptSet" returns set members (REST `memberOf`); ' +
  '"answerTo" returns answers to the given coded question (REST `answerTo`); ' +
  '"any" ignores the UUID and searches all concepts.';

export const configSchema = {
  procedurePageSize: {
    _type: Type.Number,
    _description: 'Default page size for the procedures table',
    _default: 5,
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
    _default: 'conceptClass',
    _validators: [validators.oneOf(conceptSourceTypes)],
  },
  bodySiteConceptUuid: {
    _type: Type.UUID,
    _description:
      'UUID used to constrain the body-site concept search. Its meaning is determined by `bodySiteConceptSourceType`.',
    _default: '',
  },
  bodySiteConceptSourceType: {
    _type: Type.String,
    _description: sourceTypeDescription,
    _default: 'any',
    _validators: [validators.oneOf(conceptSourceTypes)],
  },
  statusConceptUuid: {
    _type: Type.UUID,
    _description:
      'UUID used to constrain the procedure-status concept search. Its meaning is determined by `statusConceptSourceType`.',
    _default: '',
  },
  statusConceptSourceType: {
    _type: Type.String,
    _description: sourceTypeDescription,
    _default: 'any',
    _validators: [validators.oneOf(conceptSourceTypes)],
  },
  durationUnitMinutesConceptUuid: {
    _type: Type.UUID,
    _description: 'Concept UUID representing the "minutes" duration unit',
    _default: '1733AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  durationUnitHoursConceptUuid: {
    _type: Type.UUID,
    _description: 'Concept UUID representing the "hours" duration unit',
    _default: '1822AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  durationUnitDaysConceptUuid: {
    _type: Type.UUID,
    _description: 'Concept UUID representing the "days" duration unit',
    _default: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
};

export interface ConfigObject {
  procedurePageSize: number;
  procedureConceptUuid: string;
  procedureConceptSourceType: ConceptSourceType;
  bodySiteConceptUuid: string;
  bodySiteConceptSourceType: ConceptSourceType;
  statusConceptUuid: string;
  statusConceptSourceType: ConceptSourceType;
  durationUnitMinutesConceptUuid: string;
  durationUnitHoursConceptUuid: string;
  durationUnitDaysConceptUuid: string;
}
