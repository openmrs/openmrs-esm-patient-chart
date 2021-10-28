import { openmrsFetch, OmrsOfflineHttpHeaders, omrsOfflineCachingStrategyHttpHeaderName } from '@openmrs/esm-framework';
import { formEncounterUrl } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { FormEncounter } from '../types';
import escapeRegExp from 'lodash-es/escapeRegExp';
import useSWR from 'swr';

export function useOfflineFormInfo(form: FormEncounter) {
  const isFormFullyCachedSwr = useSWR(`offlineFormInfo/${form.uuid}`, () => isFormFullyCached(form.uuid));
  const { formsMarkedAsOffline, setMarkedForOffline } = useOfflineFormsLocalStorage();
  const isFormMarkedAsOffline = formsMarkedAsOffline.some((markedForm) => markedForm.uuid === form.uuid);

  const registerFormAsOffline = async () => {
    setMarkedForOffline(form.uuid, true);
    isFormFullyCachedSwr.mutate(async () => {
      await addFormToCache(form.uuid);
      return await isFormFullyCached(form.uuid);
    });
  };

  const unregisterFormAsOffline = () => {
    setMarkedForOffline(form.uuid, false);
  };

  return {
    isFormFullyCachedSwr,
    isFormMarkedAsOffline,
    registerFormAsOffline,
    unregisterFormAsOffline,
  };
}

function useOfflineFormsLocalStorage() {
  const [formsMarkedAsOffline, setFormsMarkedAsOffline] = useLocalStorage<Array<{ uuid: string }>>(
    '@openmrs/esm-patient-forms-app:offline-forms',
    [],
  );

  const setMarkedForOffline = (uuid: string, markedForOffline: boolean) => {
    if (markedForOffline) {
      setFormsMarkedAsOffline((previous) => [...previous, { uuid }]);
    } else {
      setFormsMarkedAsOffline((previous) => previous.filter((entry) => entry.uuid !== uuid));
    }
  };

  return {
    formsMarkedAsOffline,
    setMarkedForOffline,
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
