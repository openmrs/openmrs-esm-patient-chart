import { useFormEncounters } from '../hooks/use-forms';
import { isValidOfflineFormEncounter } from './offline-form-helpers';
import { HtmlFormEntryForm } from '../config-schema';

/**
 * Returns an `SWRResult` of those form encounters that work with offline mode.
 */
export function useValidOfflineFormEncounters(htmlFormEntryForms: Array<HtmlFormEntryForm>) {
  const formEncountersSwr = useFormEncounters();

  return {
    ...formEncountersSwr,
    data: formEncountersSwr.data?.filter((form) => isValidOfflineFormEncounter(form, htmlFormEntryForms)),
  };
}
