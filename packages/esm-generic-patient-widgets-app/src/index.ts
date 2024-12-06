import { defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import obsSwitchableComponent from './obs-switchable/obs-switchable.component';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-generic-patient-widgets-app';

const options = {
  featureName: 'Generic widgets',
  moduleName,
};

export const switchableObs = getSyncLifecycle(obsSwitchableComponent, options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
