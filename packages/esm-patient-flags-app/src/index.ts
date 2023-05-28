import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  patientflags: '^3.0.0',
};

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-patient-flags-app';

  const options = {
    featureName: 'patient-flags',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    pages: [],
    extensions: [
      {
        name: 'patient-flags-tag',
        slot: 'what-is-new-bar-slot',
        order: 0,
        load: getAsyncLifecycle(() => import('./patient-flags/patient-flags-tag.component'), options),
        online: true,
        offline: false,
      },
      {
        name: 'patient-flags-overview',
        slot: 'patient-chart-summary-dashboard-slot',
        order: -1,
        load: getAsyncLifecycle(() => import('./patient-flags/patient-flags.component'), options),
        meta: {
          columnSpan: 4,
        },
        online: { showAddAllergyButton: true },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
