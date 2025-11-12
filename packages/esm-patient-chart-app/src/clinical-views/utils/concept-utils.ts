import type { Encounter } from '../types';

/**
 * Helper function to extract units from an encounter for a specific concept
 * @param encounter The encounter containing observations
 * @param conceptUuid The concept UUID to find
 * @returns The units string if found
 */
export function getConceptUnitsFromEncounter(encounter: Encounter | null, conceptUuid: string): string {
  if (!encounter || !encounter.obs || !conceptUuid) {
    return '';
  }

  // Find the observation for this concept
  const obs = encounter.obs.find((o) => o.concept?.uuid === conceptUuid);

  // Return the units if found
  return obs?.concept?.units || '';
}

export const withUnit = (value: string | number, unit: string | null | undefined) => {
  if (!value || value === '--') return value;
  return unit ? `${value} ${unit}` : value;
};
