import { Type } from '@openmrs/esm-framework';
import notesConfigSchema, { type VisitNoteConfigObject } from './notes/visit-note-config-schema';

export const configSchema = {
  diagnosisConceptClass: {
    _type: Type.UUID,
    _default: '8d4918b0-c2cc-11de-8d13-0010c6dffd0f',
    _description: 'The concept class to use for the diagnoses',
  },
  visitNoteConfig: notesConfigSchema,
  stickyNoteConceptUuid: {
    _type: Type.ConceptUuid,
    _default: '165095AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    _description: 'The concept UUID being used to map sticky notes data',
  },
};

export interface ConfigObject {
  diagnosisConceptClass: string;
  visitNoteConfig: VisitNoteConfigObject;
  stickyNoteConceptUuid: string;
}
