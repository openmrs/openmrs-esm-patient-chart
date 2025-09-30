import { defineExtensionConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchemaSwitchable } from './config-schema-obs-switchable';
import obsSwitchableComponent from './obs-switchable/obs-switchable.component';
import obsTableHorizontalComponent from './obs-table-horizontal/obs-table-horizontal.component';
import { configSchemaHorizontal } from './config-schema-obs-horizontal';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-generic-patient-widgets-app';

const options = {
  featureName: 'Generic widgets',
  moduleName,
};

export const switchableObs = getSyncLifecycle(obsSwitchableComponent, options);

export const obsTableHorizontal = getSyncLifecycle(obsTableHorizontalComponent, options);

export function startupApp() {
  defineExtensionConfigSchema('obs-by-encounter-widget', configSchemaSwitchable);
  defineExtensionConfigSchema('obs-table-horizontal-widget', configSchemaHorizontal);
}
