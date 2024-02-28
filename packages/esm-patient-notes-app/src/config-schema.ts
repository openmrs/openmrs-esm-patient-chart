import { Type } from '@openmrs/esm-framework';
import notesConfigSchema, { type VisitNoteConfigObject } from './notes/visit-note-config-schema';

export const configSchema = {
  visitNoteConfig: notesConfigSchema,
  numberOfVisitsToLoad: {
    _type: Type.Number,
    _description: 'The number of visits to load initially in the Visits Summary tab. Defaults to 5',
    _default: 5,
  },
};

export interface ConfigObject {
  visitNoteConfig: VisitNoteConfigObject;
}
