import 'reflect-metadata';
import 'zone.js/dist/zone';
import { defineConfigSchema, messageOmrsServiceWorker } from '@openmrs/esm-framework';
import { setupDynamicOfflineFormDataHandler, setupStaticDataOfflinePrecaching } from './app/offline/caching';
import { configSchema } from './config-schema';
import './styles.css';

const moduleName = '@openmrs/esm-form-entry-app';

export const importTranslation = import.meta.webpackContext('../translations', {
  regExp: /\.json$/,
  recursive: false,
  mode: 'lazy',
});

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

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/o3/forms.*',
  });

  defineConfigSchema(moduleName, configSchema);
}

export const formWidget = () => import('./bootstrap');
