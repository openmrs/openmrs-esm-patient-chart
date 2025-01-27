import { defineExtensionConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-generic-patient-widgets-app';

const options = {
  featureName: 'Generic widgets',
  moduleName,
};

export function startupApp() {
  defineExtensionConfigSchema(moduleName, configSchema);
}

export const switchableObs = getAsyncLifecycle(() => import('./obs-switchable/obs-switchable.component'), options);
