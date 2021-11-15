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
        slot: dashboardMeta.slot,
        load: getAsyncLifecycle(() => import('./notes/notes.component'), options),
        meta: {
          title: 'Notes',
          view: 'notes',
        },
        online: { showAddNote: true },
        offline: { showAddNote: false },
      },
      {
        id: 'notes-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        order: 5,
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), options),
        meta: dashboardMeta,
        online: true,
        offline: true,
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
      {
        id: 'visit-note-side-rail',
        slot: 'action-menu-items-slot',
        order: 1,
        load: getAsyncLifecycle(() => import('./notes/visit-note-button.component'), {
          featureName: 'visit-note-side-rail',
          moduleName,
        }),
      },
    ],
  };
}

export { backendDependencies, frontendDependencies, importTranslation, setupOpenMRS };
