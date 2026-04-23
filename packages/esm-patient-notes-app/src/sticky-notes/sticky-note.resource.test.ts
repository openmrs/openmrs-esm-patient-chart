import { isStandaloneStickyNote, type StickyNoteObs } from './sticky-note.resource';

const baseObs: StickyNoteObs = {
  uuid: 'uuid',
  value: 'note text',
  obsDatetime: '2026-01-20T11:38:02+00:00',
  encounter: null,
  formNamespaceAndPath: null,
};

describe('isStandaloneStickyNote', () => {
  it('accepts an obs with no encounter and no form binding', () => {
    expect(isStandaloneStickyNote(baseObs)).toBe(true);
  });

  it('rejects an obs attached to an encounter', () => {
    expect(isStandaloneStickyNote({ ...baseObs, encounter: { uuid: 'encounter-uuid' } })).toBe(false);
  });

  it('rejects an obs created via a form engine', () => {
    expect(isStandaloneStickyNote({ ...baseObs, formNamespaceAndPath: 'form-ns^form-path' })).toBe(false);
  });
});
