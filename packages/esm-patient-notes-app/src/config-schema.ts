import { Type } from '@openmrs/esm-framework';
import notesConfigSchema, { VisitNoteConfigObject } from './notes/visit-note-config-schema';

export const configSchema = {
  visitNoteConfig: notesConfigSchema,
  diagnosisConceptUuid: {
    _type: Type.Array,
    _default: ['8d4918b0-c2cc-11de-8d13-0010c6dffd0f'],
  },
};

export interface ConfigObject {
  visitNoteConfig: VisitNoteConfigObject;
  diagnosisConceptUuid: string;
}
