import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@openmrs/esm-patient-flags-app';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const flagTags = getAsyncLifecycle(() => import('./flags/flags-highlight-bar.component'), {
  featureName: 'patient-flag-tags',
  moduleName,
});

export const flagsOverview = getAsyncLifecycle(() => import('./flags/flags.component'), {
  featureName: 'patient-flags-overview',
  moduleName,
});

export const patientFlagsWorkspace = getAsyncLifecycle(() => import('./flags/patient-flags.workspace'), {
  featureName: 'patient-flags-workspace',
  moduleName,
});

/**
 * DO NOT REMOVE THE FOLLOWING TRANSLATIONS
 * t('editPatientFlags','Edit patient flags')
 */
