import {
  makeUrl,
  messageOmrsServiceWorker,
  omrsOfflineCachingStrategyHttpHeaderName,
  openmrsFetch,
  setupDynamicOfflineDataHandler,
  subscribePrecacheStaticDependencies,
} from '@openmrs/esm-framework';
import { FormSchemaCompiler } from '@openmrs/ngx-formentry';
import escapeRegExp from 'lodash-es/escapeRegExp';
import { FormSchemaService } from '../form-schema/form-schema.service';
import { FormEncounter, FormSchema } from '../types';
import { ConceptService } from '../services/concept.service';

export function setupStaticDataOfflinePrecaching() {
  subscribePrecacheStaticDependencies(async () => {
    const urlsToCache = [
      '/ws/rest/v1/location?q=&v=custom:(uuid,display)',
      '/ws/rest/v1/provider?q=&v=custom:(uuid,display,person:(uuid))',
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
  const getFormRes = await openmrsFetch<FormEncounter>(`/ws/rest/v1/form/${formUuid}?v=full`);
  const form = getFormRes.data;
  const getClobdataRes = await openmrsFetch(`/ws/rest/v1/clobdata/${form.resources[0].valueReference}?v=full`);
  const clobdata = getClobdataRes.data;

  if (!form || !clobdata) {
    throw new Error(`The form data could not be loaded from the server. (Form UUID: ${formUuid})`);
  }

  const formSchemaCompiler = new FormSchemaCompiler();
  const formSchema = formSchemaCompiler.compileFormSchema(
    {
      ...form,
      pages: clobdata.pages ?? [],
      referencedForms: clobdata.referencedForms ?? [],
      processor: clobdata.processor,
    },
    [],
  ) as FormSchema;

  const requiredConceptIdentifiers = FormSchemaService.getUnlabeledConceptIdentifiersFromSchema(formSchema);
  const conceptUrls = ConceptService.getConceptReferenceUrls(requiredConceptIdentifiers).map(
    (relativeUrl) => `/ws/rest/v1/${relativeUrl}`,
  );

  return [
    // Required by:
    // - https://github.com/openmrs/openmrs-esm-patient-chart/blob/415790e1ad9b8bdbd1201958d21a06fa93ec7237/packages/esm-form-entry-app/src/app/openmrs-api/form-resource.service.ts#L21
    // - https://github.com/openmrs/openmrs-esm-patient-chart/blob/415790e1ad9b8bdbd1201958d21a06fa93ec7237/packages/esm-form-entry-app/src/app/form-schema/form-schema.service.ts#L31
    // - https://github.com/openmrs/openmrs-esm-patient-chart/blob/415790e1ad9b8bdbd1201958d21a06fa93ec7237/packages/esm-form-entry-app/src/app/form-schema/form-schema.service.ts#L164
    `/ws/rest/v1/form/${formUuid}?v=full`,

    // Required by:
    // - https://github.com/openmrs/openmrs-esm-patient-chart/blob/415790e1ad9b8bdbd1201958d21a06fa93ec7237/packages/esm-form-entry-app/src/app/openmrs-api/form-resource.service.ts#L10
    // - https://github.com/openmrs/openmrs-esm-patient-chart/blob/415790e1ad9b8bdbd1201958d21a06fa93ec7237/packages/esm-form-entry-app/src/app/form-schema/form-schema.service.ts#L167
    `/ws/rest/v1/clobdata/${form.resources[0].valueReference}?v=full`,

    // Required by:
    // - https://github.com/openmrs/openmrs-esm-patient-chart/blob/cb020d4083f564fcda8864dff2897bc3fb9cc8a5/packages/esm-form-entry-app/src/app/services/concept.service.ts#L23
    ...conceptUrls,
  ].filter(Boolean);
}
