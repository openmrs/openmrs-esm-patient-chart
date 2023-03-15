import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink, getPatientSummaryOrder } from '@openmrs/esm-patient-common-lib';
import { dashboardMeta } from './dashboard.meta';

declare var __VERSION__: string;
// __VERSION__ is replaced by Webpack with the version from package.json
const version = __VERSION__;

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
        order: getPatientSummaryOrder('Appointments'),
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
      },
      {
        name: 'appointment-cancel-confirmation-dialog',
        load: getAsyncLifecycle(() => import('./appointments/appointments-cancel-modal.component'), options),
        online: true,
        offline: false,
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS, version };
