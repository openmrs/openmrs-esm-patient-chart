import notesConfigSchema, { type VisitNoteConfigObject } from './notes/visit-note-config-schema';

export const configSchema = {
  visitNoteConfig: notesConfigSchema,
};

export interface ConfigObject {
  [x: string]: any;
  visitNoteConfig: VisitNoteConfigObject;
}
