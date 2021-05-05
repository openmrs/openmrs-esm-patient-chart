import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { backendDependencies } from './openmrs-backend-dependencies';
import { dashboardMeta } from './dashboard.meta';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-patient-conditions-app';

  const options = {
    featureName: 'patient-conditions',
    moduleName,
  };

  defineConfigSchema(moduleName, {});

  return {
    extensions: [
      {
        id: 'conditions-overview-widget',
        slot: 'patient-chart-summary-dashboard-slot',
        load: getAsyncLifecycle(() => import('./conditions/conditions-overview.component'), options),
        meta: {
          columnSpan: 2,
        },
      },
      {
        id: 'conditions-details-widget',
        slot: dashboardMeta.slot,
        load: getAsyncLifecycle(() => import('./conditions/conditions.component'), options),
        meta: {
          columnSpan: 4,
        },
      },
      {
        id: 'conditions-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), options),
        meta: dashboardMeta,
      },
      {
        id: 'conditions-form-workspace',
        load: getAsyncLifecycle(() => import('./conditions/conditions-form.component'), options),
        meta: {
          title: 'Record a Condition',
        },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
