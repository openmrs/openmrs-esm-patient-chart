import { toDateOnlyString } from './utils';

describe('toDateOnlyString', () => {
  it('should convert a valid Date to YYYY-MM-DD format', () => {
    const date = new Date('2025-12-31T23:59:59.999Z');
    expect(toDateOnlyString(date)).toBe('2025-12-31');
  });

  it('should handle dates at the start of the year', () => {
    const date = new Date('2025-01-01T00:00:00.000Z');
    expect(toDateOnlyString(date)).toBe('2025-01-01');
  });

  it('should pad single-digit months and days with zeros', () => {
    const date = new Date('2025-03-05T12:00:00.000Z');
    expect(toDateOnlyString(date)).toBe('2025-03-05');
  });

  it('should preserve the date without timezone conversion', () => {
    // Create a date in local timezone
    const date = new Date(2025, 11, 31); // December 31, 2025
    const result = toDateOnlyString(date);
    expect(result).toBe('2025-12-31');
  });

  it('should throw error for null date', () => {
    expect(() => toDateOnlyString(null as any)).toThrow('Invalid date provided to toDateOnlyString');
  });

  it('should throw error for undefined date', () => {
    expect(() => toDateOnlyString(undefined as any)).toThrow('Invalid date provided to toDateOnlyString');
  });

  it('should throw error for invalid date', () => {
    const invalidDate = new Date('invalid');
    expect(() => toDateOnlyString(invalidDate)).toThrow('Invalid date provided to toDateOnlyString');
  });

  it('should throw error for non-Date object', () => {
    expect(() => toDateOnlyString('2025-12-31' as any)).toThrow('Invalid date provided to toDateOnlyString');
  });

  it('should handle leap year dates correctly', () => {
    const date = new Date('2024-02-29T12:00:00.000Z');
    expect(toDateOnlyString(date)).toBe('2024-02-29');
  });

  it('should handle dates far in the future', () => {
    const date = new Date('2099-12-31T23:59:59.999Z');
    expect(toDateOnlyString(date)).toBe('2099-12-31');
  });

  it('should handle dates far in the past', () => {
    const date = new Date('1900-01-01T00:00:00.000Z');
    expect(toDateOnlyString(date)).toBe('1900-01-01');
  });
});
