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
  providerRoles: {
    _type: Type.Array,
    _elements: { _type: Type.UUID },
    _default: [],
    _description:
      'Array of provider role uuids. Users with the "Edit Encounters On Behalf Of Others" privilege can choose the clinician of a visit note; if this is specified, only providers with one of these roles are listed. Empty means all providers.',
  },
  visitNoteConfig: notesConfigSchema,
};

export interface ConfigObject {
  diagnosisConceptClass: string;
  isPrimaryDiagnosisRequired: boolean;
  stickyNoteConceptUuid: string;
  providerRoles: Array<string>;
  visitNoteConfig: VisitNoteConfigObject;
}
