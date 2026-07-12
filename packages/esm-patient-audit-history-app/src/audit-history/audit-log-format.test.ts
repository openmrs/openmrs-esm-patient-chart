import { describe, it, expect, vi } from 'vitest';

vi.mock('@openmrs/esm-framework', () => ({
  parseDate: (s: string) => new Date(s),
  formatDatetime: (d: Date) => `formatted:${d.toISOString()}`,
  formatDate: (d: Date) => `dateonly:${d.toISOString().slice(0, 10)}`,
}));

import { humanizeFieldName, formatDisplayValue, formatRevisionDatetime } from './audit-log-format';

describe('humanizeFieldName', () => {
  it('maps known fields to friendly labels', () => {
    expect(humanizeFieldName('gender')).toBe('Gender');
    expect(humanizeFieldName('deathdateEstimated')).toBe('Death date estimated');
    expect(humanizeFieldName('causeOfDeath')).toBe('Cause of death');
  });

  it('falls back to a title-cased split for unknown camelCase fields', () => {
    expect(humanizeFieldName('someUnknownField')).toBe('Some Unknown Field');
  });
});

describe('formatDisplayValue', () => {
  it('prefers the backend-resolved display when present', () => {
    expect(formatDisplayValue('Concept#88', 'Malaria (Concept#88)')).toBe('Malaria (Concept#88)');
  });

  it('formats ISO-8601 date values', () => {
    expect(formatDisplayValue('2026-06-20T11:07:17Z')).toContain('formatted:');
  });

  it('formats date-only fields without a time component', () => {
    expect(formatDisplayValue('1990-01-01T00:00:00Z', null, 'birthdate')).toContain('dateonly:');
  });

  it('leaves plain (non-date) values unchanged', () => {
    expect(formatDisplayValue('F')).toBe('F');
    expect(formatDisplayValue('Concept#88')).toBe('Concept#88');
  });

  it('returns an empty string for an empty value', () => {
    expect(formatDisplayValue('')).toBe('');
  });
});

describe('formatRevisionDatetime', () => {
  it('parses the GMT backend timestamp and formats it via formatDatetime', () => {
    expect(formatRevisionDatetime('20/06/2026 14:30:45')).toBe('formatted:2026-06-20T14:30:45.000Z');
  });

  it('returns an empty value unchanged', () => {
    expect(formatRevisionDatetime('')).toBe('');
  });

  it('returns an unparseable value unchanged', () => {
    expect(formatRevisionDatetime('not a date')).toBe('not a date');
  });
});
