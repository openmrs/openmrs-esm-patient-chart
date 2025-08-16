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

export const patientFlagsWorkspace = getAsyncLifecycle(() => import('./flags/patient-flags.workspace'), {
  featureName: 'patient-flags-workspace',
  moduleName,
});

/**
 * DO NOT REMOVE THE FOLLOWING TRANSLATIONS
 * t('editPatientFlags','Edit patient flags')
 */
