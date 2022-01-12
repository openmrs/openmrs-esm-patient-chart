import {
  defineConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  messageOmrsServiceWorker,
} from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
  fhir2: '^1.2.0',
};

const frontendDependencies = {
  '@openmrs/esm-framework': process.env.FRAMEWORK_VERSION,
};

function setupOpenMRS() {
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/encounter.+',
  });

  const moduleName = '@openmrs/esm-patient-notes-app';

  const options = {
    featureName: 'patient-notes',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        id: 'notes-overview-widget',
        slot: 'patient-chart-summary-dashboard-slot',
        order: 7,
        load: getAsyncLifecycle(() => import('./notes/notes-overview.component'), options),
        meta: {
          columnSpan: 4,
        },
        online: { showAddNote: true },
        offline: { showAddNote: false },
      },
      {
        id: 'notes-details-widget',
        slot: 'patient-chart-form-dashboard-slot',
        load: getAsyncLifecycle(() => import('./notes/notes-detailed-summary.component'), options),
        online: { showAddNote: true },
        offline: { showAddNote: false },
      },
      {
        id: 'visit-notes-form-workspace',
        load: getAsyncLifecycle(() => import('./notes/visit-notes-form.component'), options),
        meta: {
          title: {
            key: 'visitNote',
            default: 'Visit Note',
          },
        },
      },
    ],
  };
}

export { backendDependencies, frontendDependencies, importTranslation, setupOpenMRS };
