import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import flagTagsComponent from './flags/flags-highlight-bar.component';
import flagsOverviewComponent from './flags/flags.component';

const moduleName = '@openmrs/esm-patient-flags-app';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const flagTags = getSyncLifecycle(flagTagsComponent, {
  featureName: 'patient-flag-tags',
  moduleName,
});

export const flagsOverview = getSyncLifecycle(flagsOverviewComponent, {
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
