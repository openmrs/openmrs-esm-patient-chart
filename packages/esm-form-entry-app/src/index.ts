import 'reflect-metadata';
import 'zone.js';
import { defineConfigSchema, fhirBaseUrl, messageOmrsServiceWorker, restBaseUrl } from '@openmrs/esm-framework';
import { setupDynamicOfflineFormDataHandler, setupStaticDataOfflinePrecaching } from './app/offline/caching';
import { configSchema } from './config-schema';

// FIXME: Workaround https://github.com/single-spa/single-spa-angular/issues/463#issuecomment-1468350850
// @ts-ignore
require('./styles.css?ngGlobalStyle');

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
    pattern: `.+${fhirBaseUrl}/Observation.+`,
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${restBaseUrl}/obs.+`,
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${restBaseUrl}/session.*`,
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${restBaseUrl}/provider.*`,
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${restBaseUrl}/location.*`,
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${restBaseUrl}/person.*`,
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${restBaseUrl}/form.*`,
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${restBaseUrl}/o3/forms.*`,
  });

  defineConfigSchema(moduleName, configSchema);
}

export const formWidget = () => import('./bootstrap');
