import { defineConfigSchema, getAsyncLifecycle, registerFeatureFlag } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@openmrs/esm-patient-flags-app';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);

  registerFeatureFlag(
    'patientFlags',
    'Patient Flags',
    'Visual components that enable healthcare providers to see relevant patient information with a glance in the Patient chart. Flags are displayed in the Patient Summary, just below the patient banner, and can link users to other areas of the chart to perform relevant actions during a visit.',
  );
}

export const flagTags = getAsyncLifecycle(() => import('./flags/flags-highlight-bar.component'), {
  featureName: 'patient-flag-tags',
  moduleName,
});

export const flagsOverview = getAsyncLifecycle(() => import('./flags/flags.component'), {
  featureName: 'patient-flags-overview',
  moduleName,
});

export const editFlagsSidePanel = getAsyncLifecycle(() => import('./flags/flags-list.component'), {
  featureName: 'edit-flags-side-panel-form',
  moduleName,
});
