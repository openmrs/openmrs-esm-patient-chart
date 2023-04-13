import 'systemjs-webpack-interop/resource-query-public-path?systemjsModuleName=@openmrs/esm-form-entry-app';
import 'zone.js/dist/zone';
import 'reflect-metadata'; 
import { defineConfigSchema, messageOmrsServiceWorker } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { setupDynamicOfflineFormDataHandler, setupStaticDataOfflinePrecaching } from './app/offline/caching';

declare var __VERSION__: string;
// __VERSION__ is replaced by Webpack with the version from package.json
const version = __VERSION__; 

const backendDependencies = { 'webservices.rest': '^2.24.0' };
const importTranslation = require.context('../translations', false, /.json$/, 'lazy');
const moduleName = '@openmrs/esm-form-entry-app';

function setupOpenMRS() {
  setupStaticDataOfflinePrecaching();
  setupDynamicOfflineFormDataHandler();

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/fhir2/R4/Observation.+',
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/obs.+',
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/session.*',
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/provider.*',
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/location.*',
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/person.*',
  });

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        name: 'form-widget',
        slot: 'form-widget-slot',
        load: () => import('./bootstrap'),
        online: {
          isOffline: false,
        },
        offline: {
          isOffline: true,
        },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS, version };
