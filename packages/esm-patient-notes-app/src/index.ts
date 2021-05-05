import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';
import { backendDependencies } from './openmrs-backend-dependencies';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

function setupOpenMRS() {
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
        load: getAsyncLifecycle(() => import('./notes/notes-overview.component'), options),
        meta: {
          columnSpan: 4,
        },
      },
      {
        id: 'notes-details-widget',
        slot: dashboardMeta.slot,
        load: getAsyncLifecycle(() => import('./notes/notes.component'), options),
        meta: {
          title: 'Notes',
          view: 'notes',
        },
      },
      {
        id: 'notes-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), options),
        meta: dashboardMeta,
      },
      {
        id: 'visit-notes-workspace',
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

export { backendDependencies, importTranslation, setupOpenMRS };
