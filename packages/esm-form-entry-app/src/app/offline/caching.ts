import {
  makeUrl,
  messageOmrsServiceWorker,
  omrsOfflineCachingStrategyHttpHeaderName,
  openmrsFetch,
  restBaseUrl,
  setupDynamicOfflineDataHandler,
  subscribePrecacheStaticDependencies,
} from '@openmrs/esm-framework';
import escapeRegExp from 'lodash-es/escapeRegExp';
import type { FormSchema } from '../types';

export function setupStaticDataOfflinePrecaching() {
  subscribePrecacheStaticDependencies(async () => {
    const urlsToCache = [
      `${restBaseUrl}/location?q=&v=custom:(uuid,display)`,
      `${restBaseUrl}/provider?q=&v=custom:(uuid,display,person:(uuid))`,
    ];

    await Promise.all(
      urlsToCache.map(async (url) => {
        await messageOmrsServiceWorker({
          type: 'registerDynamicRoute',
          pattern: '.+' + url,
        });
        await openmrsFetch(url);
      }),
    );
  });
}

export function setupDynamicOfflineFormDataHandler() {
  setupDynamicOfflineDataHandler({
    id: 'esm-form-entry-app:form',
    type: 'form',
    displayName: 'Form entry',
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
  const getFormRes = await openmrsFetch<FormSchema>(`${restBaseUrl}/o3/forms/${formUuid}`);
  const form = getFormRes.data;

  if (!form) {
    throw new Error(`The form data could not be loaded from the server. (Form UUID: ${formUuid})`);
  }

  return [
    // Required by:
    // - https://github.com/openmrs/openmrs-esm-patient-chart/blob/415790e1ad9b8bdbd1201958d21a06fa93ec7237/packages/esm-form-entry-app/src/app/openmrs-api/form-resource.service.ts#L21
    // - https://github.com/openmrs/openmrs-esm-patient-chart/blob/415790e1ad9b8bdbd1201958d21a06fa93ec7237/packages/esm-form-entry-app/src/app/form-schema/form-schema.service.ts#L31
    // - https://github.com/openmrs/openmrs-esm-patient-chart/blob/415790e1ad9b8bdbd1201958d21a06fa93ec7237/packages/esm-form-entry-app/src/app/form-schema/form-schema.service.ts#L164
    `${restBaseUrl}/form/${formUuid}?v=full`,

    // Required by:
    // - https://github.com/openmrs/openmrs-esm-patient-chart/blob/415790e1ad9b8bdbd1201958d21a06fa93ec7237/packages/esm-form-entry-app/src/app/openmrs-api/form-resource.service.ts#L10
    // - https://github.com/openmrs/openmrs-esm-patient-chart/blob/415790e1ad9b8bdbd1201958d21a06fa93ec7237/packages/esm-form-entry-app/src/app/form-schema/form-schema.service.ts#L167
    `${restBaseUrl}/o3/forms/${formUuid}`,
  ].filter(Boolean);
}
