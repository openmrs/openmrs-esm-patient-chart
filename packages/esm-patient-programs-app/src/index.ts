import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
};

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-patient-programs-app';

  const options = {
    featureName: 'patient-programs',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        name: 'programs-overview-widget',
        slot: 'patient-chart-summary-dashboard-slot',
        order: 0,
        load: getAsyncLifecycle(() => import('./programs/programs-overview.component'), options),
        meta: {
          columnSpan: 4,
        },
      },
      {
        name: 'programs-details-widget',
        slot: dashboardMeta.slot,
        load: getAsyncLifecycle(() => import('./programs/programs-detailed-summary.component'), options),
        meta: {
          columnSpan: 1,
        },
      },
      {
        name: 'programs-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        order: 10,
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), options),
        meta: dashboardMeta,
      },
      {
        name: 'programs-form-workspace',
        load: getAsyncLifecycle(() => import('./programs/programs-form.component'), options),
        meta: {
          title: 'Record program enrollment',
        },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
