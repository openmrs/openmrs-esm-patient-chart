import { useConfig } from '@openmrs/esm-framework';
import { useFormEncounters } from '../hooks/use-forms';
import { isValidOfflineFormEncounter } from './offline-form-helpers';
import { type ConfigObject } from '../config-schema';

/**
 * Returns an `SWRResult` of those form encounters that work with offline mode.
 */
export function useValidOfflineFormEncounters() {
  const formEncountersSwr = useFormEncounters();
  const config = useConfig<ConfigObject>();
  return {
    ...formEncountersSwr,
    data: formEncountersSwr.data?.filter((form) => isValidOfflineFormEncounter(form, config.htmlFormEntryForms)),
  };
}
