import { Type } from '@openmrs/esm-framework';
import notesConfigSchema, { type VisitNoteConfigObject } from './notes/visit-note-config-schema';

export const configSchema = {
  diagnosisConceptClass: {
    _type: Type.UUID,
    _default: '8d4918b0-c2cc-11de-8d13-0010c6dffd0f',
    _description: 'The concept class to use for the diagnoses',
  },
  visitNoteConfig: notesConfigSchema,
};

export interface ConfigObject {
  diagnosisConceptClass: string;
  visitNoteConfig: VisitNoteConfigObject;
}
