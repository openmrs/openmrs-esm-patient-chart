import { openmrsFetch, OmrsOfflineHttpHeaders, omrsOfflineCachingStrategyHttpHeaderName } from '@openmrs/esm-framework';
import { formEncounterUrl } from '../constants';
import { useFormEncounters } from '../hooks/useForms';
import { useLocalStorage } from '../hooks/useLocalStorage';
import escapeRegExp from 'lodash-es/escapeRegExp';
import { FormEncounter } from '../types';

export function useOfflineForms() {
  const formsResponse = useFormEncounters();
  return;
}

export interface OfflineFormState {
  formEncounter: FormEncounter;
  markedForOffline: boolean;
  synchronizationStatus: 'unknown' | 'synchronizing' | 'synchronized';
}

function useCurrentOfflineFormsState() {
  const [offlineForms, setOfflineForms] = useLocalStorage<Array<{ uuid: string }>>(
    '@openmrs/esm-patient-forms-app:offline-forms',
    [],
  );
  const registerOfflineForm = (uuid: string) => {
    setOfflineForms((previous) => [...previous, { uuid }]);
    addFormToCache(uuid);
  };
  const unregisterOfflineForm = (uuid: string) => {
    setOfflineForms((previous) => previous.filter((entry) => entry.uuid !== uuid));
  };

  return {
    offlineForms,
    registerOfflineForm,
    unregisterOfflineForm,
  };
}

async function addFormToCache(uuid: string) {
  const urlsToCache = getCacheableFormUrls(uuid);
  const headers: OmrsOfflineHttpHeaders = {
    [omrsOfflineCachingStrategyHttpHeaderName]: 'network-first',
  };
  await Promise.all(urlsToCache.map((urlToCache) => openmrsFetch(urlToCache, { headers })));
}

async function isFormFullyCached(uuid: string) {
  const expectedUrls = getCacheableFormUrls(uuid);
  const cache = await caches.open('omrs-spa-cache-v1'); // TODO: Ideally add the cache name as const to esm-offline.
  const keys = await cache.keys();
  return expectedUrls.every((expectedUrl) => keys.some((key) => new RegExp(escapeRegExp(expectedUrl)).test(key.url)));
}

function getCacheableFormUrls(uuid: string) {
  // TODO: Enhance with URLs that are required for offline form-entry to work (on a per-form basis).
  // "Global" data (i.e. data shared by forms) may or may not be added depending on how frequently it is updated.
  // Doing so doesn't hurt though.
  return [formEncounterUrl];
}
