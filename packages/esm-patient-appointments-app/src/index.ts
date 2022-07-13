import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { dashboardMeta } from './dashboard.meta';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
};

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-patient-appointments-app';

  const options = {
    featureName: 'patient-appointments',
    moduleName,
  };

  defineConfigSchema(moduleName, {});

  return {
    extensions: [
      {
        name: 'appointments-overview-widget',
        slot: 'patient-chart-summary-dashboard-slot',
        order: 8,
        load: getAsyncLifecycle(() => import('./appointments/appointments-overview.component'), options),
        meta: {
          columnSpan: 4,
        },
      },
      {
        name: 'appointments-details-widget',
        slot: dashboardMeta.slot,
        load: getAsyncLifecycle(() => import('./appointments/appointments-detailed-summary.component'), options),
        meta: {
          columnSpan: 1,
        },
      },
      {
        name: 'appointments-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        order: 11,
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), options),
        meta: dashboardMeta,
      },
      {
        name: 'appointments-form-workspace',
        load: getAsyncLifecycle(() => import('./appointments/appointments-form.component'), options),
        meta: {
          title: 'Create appointment',
        },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
