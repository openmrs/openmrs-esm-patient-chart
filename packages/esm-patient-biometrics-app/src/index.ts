import {
  defineConfigSchema,
  fhirBaseUrl,
  getAsyncLifecycle,
  getSyncLifecycle,
  messageOmrsServiceWorker,
} from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';
import { backendDependencies } from './openmrs-backend-dependencies';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

function setupOpenMRS() {
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${fhirBaseUrl}/Observation.+`,
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+/ws/rest/v1/concept.+`,
  });

  const moduleName = '@openmrs/esm-patient-biometrics-app';

  const options = {
    featureName: 'patient-biometrics',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        id: 'biometrics-overview-widget',
        slot: 'patient-chart-summary-dashboard-slot',
        load: getAsyncLifecycle(() => import('./biometrics/biometrics-overview.component'), options),
        meta: {
          columnSpan: 2,
        },
        online: { showAddBiometrics: true },
        offline: { showAddBiometrics: false },
      },
      {
        id: 'results-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), options),
        meta: dashboardMeta,
        online: true,
        offline: true,
      },
      {
        id: 'biometrics-details-widget',
        slot: dashboardMeta.slot,
        load: getAsyncLifecycle(() => import('./biometrics/biometrics-overview.component'), options),
        meta: {
          view: 'biometrics',
          title: 'Biometrics',
        },
        online: { showAddBiometrics: true },
        offline: { showAddBiometrics: false },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
