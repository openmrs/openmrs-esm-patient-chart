import 'zone.js/dist/zone';
import 'reflect-metadata';
import './styles.css';
import { defineConfigSchema, messageOmrsServiceWorker } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { setupDynamicOfflineFormDataHandler, setupStaticDataOfflinePrecaching } from './app/offline/caching';

const moduleName = '@openmrs/esm-form-entry-app';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
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

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/form.*',
  });

  defineConfigSchema(moduleName, configSchema);
}

export const formWidget = () => import('./bootstrap');
