import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { dashboardMeta } from './dashboard.meta';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
};

const frontendDependencies = {
  '@openmrs/esm-framework': process.env.FRAMEWORK_VERSION,
};

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-patient-programs-app';

  const options = {
    featureName: 'patient-programs',
    moduleName,
  };

  defineConfigSchema(moduleName, {});

  return {
    extensions: [
      {
        id: 'programs-overview-widget',
        slot: 'patient-chart-summary-dashboard-slot',
        order: 0,
        load: getAsyncLifecycle(() => import('./programs/programs-overview.component'), options),
        meta: {
          columnSpan: 4,
        },
      },
      {
        id: 'programs-details-widget',
        slot: dashboardMeta.slot,
        load: getAsyncLifecycle(() => import('./programs/programs.component'), options),
        meta: {
          columnSpan: 1,
        },
      },
      {
        id: 'programs-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        order: 10,
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), options),
        meta: dashboardMeta,
      },
      {
        id: 'programs-form-workspace',
        load: getAsyncLifecycle(() => import('./programs/programs-form.component'), options),
        meta: {
          title: 'Record Program enrollment',
        },
      },
    ],
  };
}

export { backendDependencies, frontendDependencies, importTranslation, setupOpenMRS };
