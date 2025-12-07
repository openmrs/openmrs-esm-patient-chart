import { exist } from '../loadPatientTestData/helpers';

export interface ReferenceRanges {
  hiAbsolute?: number;
  hiCritical?: number;
  hiNormal?: number;
  lowAbsolute?: number;
  lowCritical?: number;
  lowNormal?: number;
  units?: string;
}

/**
 * Merges observation-level and node-level reference ranges.
 * Observation-level ranges take precedence when available.
 */
export function selectReferenceRange(
  observationRanges?: ReferenceRanges,
  nodeRanges?: ReferenceRanges,
): ReferenceRanges | null {
  if (!observationRanges && !nodeRanges) {
    return null;
  }

  if (!observationRanges) {
    return nodeRanges || null;
  }

  if (!nodeRanges) {
    return observationRanges;
  }

  // Merge: observation takes precedence for available fields.
  // Note: Units are only at the concept/node level, so units will always come from nodeRanges.
  return {
    hiAbsolute: observationRanges.hiAbsolute ?? nodeRanges.hiAbsolute,
    hiCritical: observationRanges.hiCritical ?? nodeRanges.hiCritical,
    hiNormal: observationRanges.hiNormal ?? nodeRanges.hiNormal,
    lowAbsolute: observationRanges.lowAbsolute ?? nodeRanges.lowAbsolute,
    lowCritical: observationRanges.lowCritical ?? nodeRanges.lowCritical,
    lowNormal: observationRanges.lowNormal ?? nodeRanges.lowNormal,
    units: observationRanges.units ?? nodeRanges.units,
  };
}

/**
 * Formats reference range string using lowNormal and hiNormal.
 * Note: Display format using lowAbsolute/hiAbsolute with >/< is handled in a separate ticket.
 */
export function formatReferenceRange(ranges: ReferenceRanges | null, units?: string): string {
  if (!ranges) {
    return '--';
  }

  const { lowNormal, hiNormal } = ranges;
  const displayUnits = ranges.units || units || '';

  if (exist(lowNormal, hiNormal)) {
    return `${lowNormal} – ${hiNormal}${displayUnits ? ` ${displayUnits}` : ''}`;
  }

  return '--';
}

/**
 * Checks if a formatted range string already includes the units.
 * This prevents duplicate units when appending units to a range that already has them.
 * @param range The formatted range string (e.g., "0 – 50 U/L")
 * @param units The units string (e.g., "U/L")
 * @returns true if the range already ends with the units, false otherwise
 */
export function rangeAlreadyHasUnits(range: string | undefined, units: string | undefined): boolean {
  if (!range || !units) {
    return false;
  }

  // Check if range ends with units (with optional space before)
  // This is more precise than includes() to avoid false positives
  const trimmedRange = range.trim();
  const trimmedUnits = units.trim();
  return trimmedRange.endsWith(trimmedUnits) || trimmedRange.endsWith(` ${trimmedUnits}`);
}

/**
 * Checks if a range string already contains any units (common unit patterns).
 * This helps detect if a range already has units even if they differ from the parameter.
 * @param range The formatted range string (e.g., "0 – 50 mg/dL")
 * @returns true if the range appears to already contain units, false otherwise
 */
function rangeHasAnyUnits(range: string): boolean {
  if (!range) {
    return false;
  }

  const trimmedRange = range.trim();
  // Common unit patterns: ends with common unit abbreviations or contains unit-like patterns
  // This is a heuristic to detect if units are already present
  const unitPattern = /\s+[a-zA-Z\/%°]+$/;
  return unitPattern.test(trimmedRange);
}

/**
 * Formats a reference range with units for display, avoiding duplicate units.
 * @param range The formatted range string (may or may not include units)
 * @param units The units string to append if not already present
 * @returns Formatted string with range and units (e.g., "0 – 50 U/L")
 */
export function formatRangeWithUnits(range: string | undefined, units: string | undefined): string {
  const trimmedRange = range?.trim() || '';
  const trimmedUnits = units?.trim() || '';

  // If range is empty, return '--' (even if units exist, we need a range to display)
  if (!trimmedRange) {
    return '--';
  }

  // Check if range already includes the specific units parameter
  const hasSpecificUnits = rangeAlreadyHasUnits(trimmedRange, trimmedUnits);
  if (hasSpecificUnits) {
    return trimmedRange;
  }

  // Check if range already has any units (even if different from parameter)
  // This prevents appending units when range already has different units (e.g., "0 – 50 mg/dL" with "U/L" parameter)
  const hasAnyUnits = rangeHasAnyUnits(trimmedRange);
  if (hasAnyUnits) {
    return trimmedRange;
  }

  // Append units if not already present
  return trimmedUnits ? `${trimmedRange} ${trimmedUnits}` : trimmedRange;
}

/**
 * Finds the most recent observation that has reference range data.
 */
export function getMostRecentObservationWithRange<
  T extends { obsDatetime: string; lowNormal?: number; hiNormal?: number },
>(observations: Array<T | undefined>): T | null {
  if (!observations || observations.length === 0) {
    return null;
  }

  // Filter out undefined and find observations with range data
  const validObservations = observations.filter(
    (obs): obs is T => obs !== undefined && (obs.lowNormal !== undefined || obs.hiNormal !== undefined),
  );

  if (validObservations.length === 0) {
    return null;
  }

  // Sort by obsDatetime descending (most recent first)
  const sorted = [...validObservations].sort((a, b) => {
    const dateA = new Date(a.obsDatetime).getTime();
    const dateB = new Date(b.obsDatetime).getTime();
    return dateB - dateA;
  });

  return sorted[0];
}
