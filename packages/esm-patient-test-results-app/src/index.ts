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

declare var __VERSION__: string;
// __VERSION__ is replaced by Webpack with the version from package.json
const version = __VERSION__;

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
  fhir2: '^1.2.0',
};

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
      // Removed this extension with reference to O3-1810
      // {
      //   name: 'test-results-summary-widget',
      //   slot: 'patient-chart-summary-dashboard-slot',
      //   order: 2,
      //   load: getAsyncLifecycle(() => import('./overview/recent-overview.component'), options),
      //   meta: {
      //     columnSpan: 4,
      //   },
      //   online: true,
      //   offline: true,
      // },
      {
        name: 'test-results-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        order: 4,
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), options),
        meta: dashboardMeta,
        online: true,
        offline: true,
      },
      {
        name: 'test-results-filtered-overview',
        slot: 'test-results-filtered-overview-slot',
        load: getAsyncLifecycle(() => import('./overview/external-overview.component'), options),
        meta: {
          columnSpan: 4,
        },
        online: true,
        offline: true,
      },
      {
        name: 'results-viewer',
        slots: ['patient-chart-results-viewer-slot', dashboardMeta.slot],
        load: getAsyncLifecycle(() => import('./results-viewer'), options),
        meta: {
          columnSpan: 4,
        },
        online: true,
        offline: true,
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS, version };
