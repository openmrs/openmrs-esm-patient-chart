import useSWR from 'swr';
import { getDynamicOfflineDataEntries } from '@openmrs/esm-framework';
import { type Form, type FormEncounterResource } from '../types';
import { type HtmlFormEntryForm } from '../config-schema';

/**
 * Returns whether the given form encounter is valid for offline mode and can be cached.
 * @param form The form encounter.
 */
export function isValidOfflineFormEncounter(form: Form, htmlFormEntryForms: Array<HtmlFormEntryForm>) {
  const isHtmlForm = htmlFormEntryForms.some((htmlForm) => htmlForm.formUuid === form.uuid);
  const hasJsonSchema = form.resources.some(isFormJsonSchema);
  return !isHtmlForm && hasJsonSchema;
}

/**
 * Returns whether a form resource is a valid form JSON schema that can be utilized for the purpose
 * of offline mode.
 * @param formResource A resource of a form.
 */
export function isFormJsonSchema(formResource: FormEncounterResource) {
  return formResource.dataType === 'AmpathJsonSchema' || formResource.name === 'JSON schema';
}

export function useDynamicFormDataEntries() {
  return useSWR('dynamicFormEntries', () => getDynamicOfflineDataEntries('form'));
}
