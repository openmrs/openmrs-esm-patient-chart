import {
  makeUrl,
  messageOmrsServiceWorker,
  omrsOfflineCachingStrategyHttpHeaderName,
  openmrsFetch,
  restBaseUrl,
  setupDynamicOfflineDataHandler,
  setupOfflineSync,
  type SyncProcessOptions,
  type Visit,
} from '@openmrs/esm-framework';
import { launchFormEntry } from '@openmrs/esm-patient-common-lib';
import { type Form } from './types';
import { isFormJsonSchema } from './offline-forms/offline-form-helpers';
import { formEncounterUrl, formEncounterUrlPoc } from './constants';
import escapeRegExp from 'lodash-es/escapeRegExp';

// General note on the following imports and this file in general:
// Yes, the imports below are super super dirty.
// In fact, the entire content of this file should ideally live inside the `esm-form-entry-app` package.
// The reason for putting it in here (and doing these nasty imports) is that the code here requires
// functions from `esm-patient-common-lib`.
// The issue is integrating that lib in the `esm-form-entry-app` package while also making the build
// work. Trust me, I tried. But by now, I don't want to waste any more time on this issue when this
// workaround here exists.
// If anyone reading this comment wants to take on the challenge, please feel
// free to do so and, if successful, notify me when `launchPatientWorkspace` can be called
// from `esm-form-entry-app` and/or directly migrate this file's content to the appropriate location.
import type { PatientFormSyncItemContent } from '../../esm-form-entry-app/src/app/offline/sync';
import type { EncounterCreate } from '../../esm-form-entry-app/src/app/types';

const patientFormSyncItem = 'patient-form';

export async function setupPatientFormSync() {
  setupOfflineSync<PatientFormSyncItemContent>(patientFormSyncItem, ['visit'], syncPatientForm, {
    onBeginEditSyncItem(syncItem) {
      launchFormEntry(
        syncItem.content.formSchemaUuid,
        syncItem.descriptor.patientUuid,
        syncItem.content._id,
        'Form Entry',
      );
    },
  });
}

async function syncPatientForm(
  item: PatientFormSyncItemContent,
  options: SyncProcessOptions<PatientFormSyncItemContent>,
) {
  const associatedOfflineVisit: Visit | undefined = options.dependencies[0];
  const {
    _payloads: { encounterCreate, personUpdate },
  } = item;

  await Promise.all([
    syncEncounter(associatedOfflineVisit, encounterCreate),
    syncPersonUpdate(personUpdate?.uuid, personUpdate),
  ]);
}

async function syncEncounter(associatedOfflineVisit: Visit, encounter?: EncounterCreate) {
  if (!encounter) {
    return;
  }

  const body = {
    ...encounter,
    encounterDatetime: encounter.encounterDatetime ?? associatedOfflineVisit?.stopDatetime,
  };

  await openmrsFetch(`${restBaseUrl}/encounter`, {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body,
  });
}

async function syncPersonUpdate(personUuid?: string, personUpdate?: any) {
  if (!personUuid || !personUpdate) {
    return;
  }

  await openmrsFetch(`${restBaseUrl}/person/${personUuid}`, {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body: personUpdate,
  });
}

export async function setupDynamicFormDataHandler() {
  setupDynamicOfflineDataHandler({
    id: 'esm-patient-forms-app:form',
    type: 'form',
    displayName: 'Patient forms',
    async isSynced(identifier) {
      const expectedUrls = await getCacheableFormUrls(identifier);
      const absoluteExpectedUrls = expectedUrls.map((url) => window.origin + makeUrl(url));
      const cache = await caches.open('omrs-spa-cache-v1');
      const keys = (await cache.keys()).map((key) => key.url);
      return absoluteExpectedUrls.every((url) => keys.includes(url));
    },
    async sync(identifier) {
      const urlsToCache = await getCacheableFormUrls(identifier);
      const cacheResults = await Promise.allSettled(
        urlsToCache.map(async (urlToCache) => {
          await messageOmrsServiceWorker({
            type: 'registerDynamicRoute',
            pattern: escapeRegExp(urlToCache),
            strategy: 'network-first',
          });

          await openmrsFetch(urlToCache, {
            headers: {
              [omrsOfflineCachingStrategyHttpHeaderName]: 'network-first',
            },
          });
        }),
      );

      if (cacheResults.some((x) => x.status === 'rejected')) {
        throw new Error(`Some form data could not be properly downloaded. (Form UUID: ${identifier})`);
      }
    },
  });
}

async function getCacheableFormUrls(formUuid: string) {
  const getFormRes = await openmrsFetch<Form>(`${restBaseUrl}/form/${formUuid}?v=full`);
  const form = getFormRes.data;

  if (!form) {
    throw new Error(`The form data could not be loaded from the server. (Form UUID: ${formUuid})`);
  }

  return [formEncounterUrl, formEncounterUrlPoc].filter(Boolean);
}
