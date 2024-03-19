import { Type } from '@openmrs/esm-framework';
import notesConfigSchema, { type VisitNoteConfigObject } from './notes/visit-note-config-schema';

export const configSchema = {
  visitNoteConfig: notesConfigSchema,
  numberOfVisitsToLoad: {
    _type: Type.Number,
    _description: 'The number of visits to load initially in the Visits Summary tab. Defaults to 5',
    _default: 5,
  },
  diagnosisConceptClass: {
    _type: Type.UUID,
    _description: 'The concept class to use for the diagnoses',
    _default: '8d4918b0-c2cc-11de-8d13-0010c6dffd0f',
  },
};

export interface ConfigObject {
  visitNoteConfig: VisitNoteConfigObject;
  numberOfVisitsToLoad: number;
  diagnosisConceptClass: string;
}
