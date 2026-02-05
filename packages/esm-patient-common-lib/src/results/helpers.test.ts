import { type ReferenceRanges } from '../types';
import { exist, formatReferenceRange, assessValue } from './helpers';

describe('exist', () => {
  it('returns true when all values are defined', () => {
    expect(exist(1, 2, 3)).toBe(true);
    expect(exist(0)).toBe(true);
    expect(exist('')).toBe(true);
  });

  it('returns false when any value is null or undefined', () => {
    expect(exist(null)).toBe(false);
    expect(exist(undefined)).toBe(false);
    expect(exist(1, null, 3)).toBe(false);
    expect(exist(1, undefined)).toBe(false);
  });

  it('returns true for empty arguments', () => {
    expect(exist()).toBe(true);
  });
});

describe('formatReferenceRange', () => {
  it('returns formatted range with en-dash', () => {
    expect(formatReferenceRange({ lowNormal: 35, hiNormal: 147 })).toBe('35 – 147');
  });

  it('appends units from ranges object', () => {
    expect(formatReferenceRange({ lowNormal: 35, hiNormal: 147, units: 'U/L' })).toBe('35 – 147 U/L');
  });

  it('appends units from parameter when ranges.units is absent', () => {
    expect(formatReferenceRange({ lowNormal: 35, hiNormal: 147 }, 'mg/dL')).toBe('35 – 147 mg/dL');
  });

  it('prefers ranges.units over the units parameter', () => {
    expect(formatReferenceRange({ lowNormal: 35, hiNormal: 147, units: 'U/L' }, 'mg/dL')).toBe('35 – 147 U/L');
  });

  it('returns -- when ranges is null', () => {
    expect(formatReferenceRange(null)).toBe('--');
  });

  it('returns -- when lowNormal or hiNormal is missing', () => {
    expect(formatReferenceRange({ lowNormal: 35 })).toBe('--');
    expect(formatReferenceRange({ hiNormal: 147 })).toBe('--');
    expect(formatReferenceRange({})).toBe('--');
  });

  it('handles zero values correctly', () => {
    expect(formatReferenceRange({ lowNormal: 0, hiNormal: 10 })).toBe('0 – 10');
  });
});

describe('assessValue', () => {
  const fullRanges: ReferenceRanges = {
    lowAbsolute: 0,
    lowCritical: 10,
    lowNormal: 35,
    hiNormal: 100,
    hiCritical: 150,
    hiAbsolute: 200,
  };

  it('returns NORMAL for values within range', () => {
    expect(assessValue(50, fullRanges)).toBe('NORMAL');
    expect(assessValue(70, fullRanges)).toBe('NORMAL');
  });

  it('returns NORMAL for NaN', () => {
    expect(assessValue(NaN, fullRanges)).toBe('NORMAL');
  });

  it('returns HIGH when value exceeds hiNormal', () => {
    expect(assessValue(101, fullRanges)).toBe('HIGH');
    expect(assessValue(149, fullRanges)).toBe('HIGH');
  });

  it('returns CRITICALLY_HIGH when value reaches hiCritical (inclusive)', () => {
    expect(assessValue(150, fullRanges)).toBe('CRITICALLY_HIGH');
    expect(assessValue(175, fullRanges)).toBe('CRITICALLY_HIGH');
  });

  it('returns OFF_SCALE_HIGH when value reaches hiAbsolute (inclusive)', () => {
    expect(assessValue(200, fullRanges)).toBe('OFF_SCALE_HIGH');
    expect(assessValue(999, fullRanges)).toBe('OFF_SCALE_HIGH');
  });

  it('returns LOW when value is below lowNormal', () => {
    expect(assessValue(34, fullRanges)).toBe('LOW');
    expect(assessValue(11, fullRanges)).toBe('LOW');
  });

  it('returns CRITICALLY_LOW when value reaches lowCritical (inclusive)', () => {
    expect(assessValue(10, fullRanges)).toBe('CRITICALLY_LOW');
    expect(assessValue(5, fullRanges)).toBe('CRITICALLY_LOW');
  });

  it('returns OFF_SCALE_LOW when value reaches lowAbsolute (inclusive)', () => {
    expect(assessValue(0, fullRanges)).toBe('OFF_SCALE_LOW');
    expect(assessValue(-5, fullRanges)).toBe('OFF_SCALE_LOW');
  });

  // Boundary behavior: normal thresholds are exclusive, critical/absolute are inclusive
  it('treats values at hiNormal as NORMAL (exclusive)', () => {
    expect(assessValue(100, fullRanges)).toBe('NORMAL');
  });

  it('treats values at lowNormal as NORMAL (exclusive)', () => {
    expect(assessValue(35, fullRanges)).toBe('NORMAL');
  });

  it('works with only normal thresholds', () => {
    const normalOnly: ReferenceRanges = { lowNormal: 35, hiNormal: 100 };
    expect(assessValue(50, normalOnly)).toBe('NORMAL');
    expect(assessValue(101, normalOnly)).toBe('HIGH');
    expect(assessValue(34, normalOnly)).toBe('LOW');
  });

  it('returns NORMAL when no thresholds are provided', () => {
    expect(assessValue(50, {})).toBe('NORMAL');
  });
});
