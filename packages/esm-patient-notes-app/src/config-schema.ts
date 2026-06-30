import { Type } from '@openmrs/esm-framework';
import notesConfigSchema, { type VisitNoteConfigObject } from './notes/visit-note-config-schema';

export const configSchema = {
  diagnosisConceptClass: {
    _type: Type.UUID,
    _default: '8d4918b0-c2cc-11de-8d13-0010c6dffd0f',
    _description: 'The concept class UUID for diagnoses',
  },
  isPrimaryDiagnosisRequired: {
    _type: Type.Boolean,
    _default: true,
    _description: 'Indicates whether a primary diagnosis is required when submitting a visit note',
  },
  stickyNoteConceptUuid: {
    _type: Type.ConceptUuid,
    _default: '165095AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    _description: 'The concept UUID for storing sticky notes as observations',
  },
  visitNoteEncounterTypes: {
    _type: Type.Array,
    _elements: {
      _type: Type.String,
    },
    _default: ['Visit Note'],
    _description:
      'Encounter type names that should be treated as visit notes in visit note workflows (for example edit flow).',
  },
  visitNoteConfig: notesConfigSchema,
};

export interface ConfigObject {
  diagnosisConceptClass: string;
  isPrimaryDiagnosisRequired: boolean;
  stickyNoteConceptUuid: string;
  visitNoteEncounterTypes: Array<string>;
  visitNoteConfig: VisitNoteConfigObject;
}
