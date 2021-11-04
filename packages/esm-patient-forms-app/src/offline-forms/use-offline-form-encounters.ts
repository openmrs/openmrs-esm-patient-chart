import { useFormEncounters } from '../hooks/use-forms';
import { isValidOfflineFormEncounter } from './offline-form-helpers';

/**
 * Returns an `SWRResult` of those form encounters that work with offline mode.
 */
export function useValidOfflineFormEncounters() {
  const formEncountersSwr = useFormEncounters();

  return {
    ...formEncountersSwr,
    data: formEncountersSwr.data?.filter(isValidOfflineFormEncounter),
  };
}
