import { messageOmrsServiceWorker, openmrsFetch, subscribePrecacheStaticDependencies } from '@openmrs/esm-framework';

export function setupOfflineDataSourcePrecaching() {
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
