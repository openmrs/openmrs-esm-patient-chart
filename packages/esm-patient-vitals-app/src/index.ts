import { defineConfigSchema, fhirBaseUrl, getAsyncLifecycle, messageOmrsServiceWorker } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@openmrs/esm-patient-vitals-app';

const options = {
  featureName: 'patient-vitals',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `${fhirBaseUrl}/Observation.+`,
  });

  defineConfigSchema(moduleName, configSchema);
}

export const vitalsSummary = () => getAsyncLifecycle(() => import('./vitals/vitals-summary.component'), options);

export const vitalsMain = () => getAsyncLifecycle(() => import('./vitals/vitals-main.component'), options);

export const vitalsHeader = () =>
  getAsyncLifecycle(() => import('./vitals/vitals-header/vitals-header.component'), options);

export const vitalsAndBiometricsForm = () =>
  getAsyncLifecycle(() => import('./vitals/vitals-biometrics-form/vitals-biometrics-form.component'), options);
