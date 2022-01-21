import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {};

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-patient-clinical-view-app';

  const options = {
    featureName: 'patient-clinical-view',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        id: 'patient-clinical-view-overview',
        slot: 'patient-chart-summary-dashboard-slot',
        order: 11,
        load: getAsyncLifecycle(() => import('./clinical-view-overview/clinical-view-overview.component'), options),
        meta: {
          columnSpan: 4,
        },
        online: true,
        offline: true,
      },
      {
        id: 'patient-clinical-view-details',
        slot: dashboardMeta.slot,
        load: getAsyncLifecycle(() => import('./clinical-view-overview/clinical-view-overview.component'), options),
        online: true,
        offline: true,
      },
      {
        id: 'patient-clinical-view-form-workspace',
        load: getAsyncLifecycle(() => import('./clinical-view-form/clinical-view-form.component'), options),
        meta: {
          title: 'Add Clinical View',
        },
        online: true,
        offline: true,
      },
      {
        id: 'clinical-view-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        order: 1,
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), options),
        meta: dashboardMeta,
        online: true,
        offline: true,
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
