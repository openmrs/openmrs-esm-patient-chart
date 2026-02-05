import { type OBSERVATION_INTERPRETATION, type ReferenceRanges } from '../types';

/**
 * Checks if all provided values exist (are not null or undefined).
 */
export function exist(...args: unknown[]): boolean {
  return args.every((y) => y !== null && y !== undefined);
}

/**
 * Formats reference range as a string with optional units.
 * Uses en-dash (–) for range separator.
 *
 * @param ranges - The reference ranges object
 * @param units - Optional units string to append
 * @returns Formatted string like "35 – 147 U/L" or "--" if no valid range
 */
export function formatReferenceRange(ranges: ReferenceRanges | null, units?: string): string {
  if (!ranges) return '--';
  const { lowNormal, hiNormal } = ranges;
  const displayUnits = ranges.units || units || '';
  if (exist(lowNormal, hiNormal)) {
    return `${lowNormal} – ${hiNormal}${displayUnits ? ` ${displayUnits}` : ''}`;
  }
  return '--';
}

/**
 * Determines the interpretation of a lab value based on reference ranges.
 * Returns the appropriate interpretation level based on the value's
 * relationship to normal, critical, and absolute thresholds.
 *
 * @param value - The numeric lab result value
 * @param ranges - The reference ranges to compare against
 * @returns The interpretation category
 */
export function assessValue(value: number, ranges: ReferenceRanges): OBSERVATION_INTERPRETATION {
  if (isNaN(value)) {
    return 'NORMAL';
  }
  // Critical and absolute thresholds use inclusive (>=, <=) comparisons
  // because values at those boundaries should be flagged for clinical safety.
  // Normal thresholds use exclusive (>, <) so values at the boundary are still normal.
  if (exist(ranges.hiAbsolute) && value >= ranges.hiAbsolute!) {
    return 'OFF_SCALE_HIGH';
  }
  if (exist(ranges.hiCritical) && value >= ranges.hiCritical!) {
    return 'CRITICALLY_HIGH';
  }
  if (exist(ranges.hiNormal) && value > ranges.hiNormal!) {
    return 'HIGH';
  }
  if (exist(ranges.lowAbsolute) && value <= ranges.lowAbsolute!) {
    return 'OFF_SCALE_LOW';
  }
  if (exist(ranges.lowCritical) && value <= ranges.lowCritical!) {
    return 'CRITICALLY_LOW';
  }
  if (exist(ranges.lowNormal) && value < ranges.lowNormal!) {
    return 'LOW';
  }
  return 'NORMAL';
}
