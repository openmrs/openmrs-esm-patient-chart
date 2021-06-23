import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { dashboardMeta } from './dashboard.meta';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
  fhir: '^1.4.2',
};

const frontendDependencies = {
  "@openmrs/esm-framework": process.env.FRAMEWORK_VERSION,
};

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-patient-attachments-app';

  defineConfigSchema(moduleName, {});

  return {
    extensions: [
      {
        id: 'attachments-overview-widget',
        slot: dashboardMeta.slot,
        load: getAsyncLifecycle(() => import('./attachments/attachments-overview.component'), {
          featureName: 'patient-attachments',
          moduleName,
        }),
        meta: {
          columnSpan: 1,
        },
      },
      {
        id: 'capture-photo-widget',
        slot: 'capture-patient-photo-slot',
        load: getAsyncLifecycle(() => import('./attachments/capture-photo.component'), {
          featureName: 'capture-photo-widget',
          moduleName,
        }),
      },
      {
        id: 'attachments-results-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), {
          featureName: 'attachments-dashboard-link',
          moduleName,
        }),
        meta: dashboardMeta,
      },
    ],
  };
}

export { backendDependencies, frontendDependencies, importTranslation, setupOpenMRS };
