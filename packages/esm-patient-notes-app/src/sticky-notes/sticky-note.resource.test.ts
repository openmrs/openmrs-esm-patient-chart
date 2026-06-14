import { decodeHtmlEntities, isStandaloneStickyNote, type StickyNoteObs } from './sticky-note.resource';
import { vi, describe, it, expect } from 'vitest';

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

describe('decodeHtmlEntities', () => {
  it('decodes &lt; and &gt; to < and >', () => {
    expect(decodeHtmlEntities('&lt;b&gt;bold&lt;/b&gt;')).toBe('<b>bold</b>');
  });

  it('decodes &amp; to &', () => {
    expect(decodeHtmlEntities('Tom &amp; Jerry')).toBe('Tom & Jerry');
  });

  it('decodes &quot; and &#39; to quote characters', () => {
    expect(decodeHtmlEntities('&quot;hello&quot; &#39;world&#39;')).toBe(`"hello" 'world'`);
  });

  it('decodes numeric entities', () => {
    expect(decodeHtmlEntities('&#60;div&#62;')).toBe('<div>');
  });

  it('decodes hex entities', () => {
    expect(decodeHtmlEntities('&#x3C;span&#x3E;')).toBe('<span>');
  });

  it('returns plain text unchanged', () => {
    expect(decodeHtmlEntities('no entities here')).toBe('no entities here');
  });

  it('handles mixed encoded and plain text', () => {
    expect(decodeHtmlEntities('BP &lt; 120 &amp; HR &gt; 60')).toBe('BP < 120 & HR > 60');
  });

  it('returns an empty string for empty input', () => {
    expect(decodeHtmlEntities('')).toBe('');
  });
});
