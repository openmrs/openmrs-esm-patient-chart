import {
  OmrsOfflineHttpHeaders,
  omrsOfflineCachingStrategyHttpHeaderName,
  openmrsFetch,
  messageOmrsServiceWorker,
} from '@openmrs/esm-framework';
import { formEncounterUrl } from '../constants';
import { FormEncounter, FormEncounterResource } from '../types';
import escapeRegExp from 'lodash-es/escapeRegExp';
import { HtmlFormEntryForm } from '../config-schema';

/**
 * Returns whether the given form encounter is valid for offline mode and can be cached.
 * @param form The form encounter.
 */
export function isValidOfflineFormEncounter(form: FormEncounter, htmlFormEntryForms: Array<HtmlFormEntryForm>) {
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

export async function addFormToCache(form: FormEncounter) {
  const urlsToCache = getCacheableFormUrls(form);
  const headers: OmrsOfflineHttpHeaders = {
    [omrsOfflineCachingStrategyHttpHeaderName]: 'network-first',
  };

  await Promise.allSettled(
    urlsToCache.map(async (urlToCache) => {
      await messageOmrsServiceWorker({
        type: 'registerDynamicRoute',
        pattern: escapeRegExp(urlToCache),
        strategy: 'network-first',
      });
      await openmrsFetch(urlToCache, { headers });
    }),
  );
}

export async function isFormFullyCached(form: FormEncounter) {
  const expectedUrls = getCacheableFormUrls(form);
  const cache = await caches.open('omrs-spa-cache-v1'); // TODO: Ideally add the cache name as const to esm-offline.
  const keys = await cache.keys();
  return expectedUrls.every((expectedUrl) => keys.some((key) => new RegExp(escapeRegExp(expectedUrl)).test(key.url)));
}

function getCacheableFormUrls(form: FormEncounter) {
  // TODO: Enhance with URLs that are required for offline form-entry to work (on a per-form basis).
  // "Global" data (i.e. data shared by forms) may or may not be added depending on how frequently it is updated.
  // Doing so doesn't hurt though.
  const clobDataResource = form.resources?.find(isFormJsonSchema);

  const result = [
    formEncounterUrl,
    `/ws/rest/v1/form/${form.uuid}?v=full`,
    clobDataResource ? `/ws/rest/v1/clobdata/${clobDataResource.valueReference}?v=full` : null,
  ].filter(Boolean);

  return result;
}
