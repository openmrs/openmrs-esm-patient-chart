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

export const editPatientFlagsWorkspace = getAsyncLifecycle(() => import('./flags/flags-list.component'), {
  featureName: 'edit-flags-side-panel-form',
  moduleName,
});

/**
 * DO NOT REMOVE THE FOLLOWING TRANSLATIONS
 * t('editPatientFlags','Edit patient flags')
 */
