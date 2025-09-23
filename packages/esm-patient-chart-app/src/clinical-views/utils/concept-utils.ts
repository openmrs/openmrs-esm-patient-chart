import { useMemo } from 'react';
import { useLastEncounter } from '../hooks';
import type { Encounter } from '../types';

/**
 * Extract units directly from the encounter observation data
 * This eliminates separate API calls for concept units
 */
export function useConceptUnits(conceptUuid: string) {
  return {
    units: '', // Default empty value that will be overridden in the component
    error: null,
    isLoading: false,
  };
}

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
  const obs = encounter.obs.find(o => o.concept?.uuid === conceptUuid);
  
  // Return the units if found
  // Note: The updated representation in useLastEncounter includes the 'units' field
  return (obs?.concept as any)?.units || '';
}

export const withUnit = (value: string | number, unit: string | null | undefined) => {
  if (!value || value === '--') return value;
  return unit ? `${value} ${unit}` : value;
};