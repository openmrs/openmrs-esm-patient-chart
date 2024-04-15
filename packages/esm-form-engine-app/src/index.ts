import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { registerWorkspace } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';

const moduleName = '@openmrs/esm-form-engine-app';

const options = {
  featureName: 'form-engine',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const formRenderer = getAsyncLifecycle(() => import('./form-renderer/form-renderer.component'), options);
