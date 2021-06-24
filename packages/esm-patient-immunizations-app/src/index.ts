import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
  fhir: '^1.4.2',
};

const frontendDependencies = {
  '@openmrs/esm-framework': process.env.FRAMEWORK_VERSION,
};

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-patient-immunizations-app';

  const options = {
    featureName: 'patient-immunizations',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        id: 'immunization-overview-widget',
        slot: 'patient-chart-summary-dashboard-slot',
        load: getAsyncLifecycle(() => import('./immunizations/immunizations-overview.component'), options),
        meta: {
          columnSpan: 2,
        },
      },
      {
        id: 'immunization-details-widget',
        slot: dashboardMeta.slot,
        load: getAsyncLifecycle(() => import('./immunizations/immunizations-detailed-summary.component'), options),
        meta: {
          columnSpan: 1,
        },
      },
      {
        id: 'immunization-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), options),
        meta: dashboardMeta,
      },
    ],
  };
}

export { backendDependencies, frontendDependencies, importTranslation, setupOpenMRS };
