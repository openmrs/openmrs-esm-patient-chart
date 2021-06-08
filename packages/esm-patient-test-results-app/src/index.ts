import {
  defineConfigSchema,
  fhirBaseUrl,
  getAsyncLifecycle,
  getSyncLifecycle,
  messageOmrsServiceWorker,
} from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { backendDependencies } from './openmrs-backend-dependencies';
import { dashboardMeta } from './dashboard.meta';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

function setupOpenMRS() {
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${fhirBaseUrl}/Observation.+`,
  });

  const moduleName = '@openmrs/esm-patient-test-results-app';

  const options = {
    featureName: 'patient-test-results',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        id: 'test-results-summary-widget',
        slot: 'patient-chart-summary-dashboard-slot',
        load: getAsyncLifecycle(() => import('./overview/recent-overview.component'), options),
        meta: {
          columnSpan: 2,
        },
        online: true,
        offline: true,
      },
      {
        id: 'test-results-summary-widget',
        slot: 'test-results-filtered-overview',
        load: getAsyncLifecycle(() => import('./overview/external-overview.component'), options),
        meta: {
          columnSpan: 2,
        },
        online: true,
        offline: true,
      },
      {
        id: 'test-results-dashboard-widget',
        slot: dashboardMeta.slot,
        load: getAsyncLifecycle(() => import('./desktopView/index'), options),
        online: true,
        offline: true,
      },
      {
        id: 'test-results-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), options),
        meta: dashboardMeta,
        online: true,
        offline: true,
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
