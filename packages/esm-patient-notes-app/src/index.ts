import { defineConfigSchema, getAsyncLifecycle, messageOmrsServiceWorker } from '@openmrs/esm-framework';
import { getPatientSummaryOrder } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';

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
        name: 'notes-overview-widget',
        order: getPatientSummaryOrder('Notes'),
        load: getAsyncLifecycle(() => import('./notes/notes-overview.component'), options),
        meta: {
          columnSpan: 4,
        },
        online: { showAddNote: true },
        offline: { showAddNote: false },
      },
      {
        name: 'notes-details-widget',
        slot: 'patient-chart-form-dashboard-slot',
        load: getAsyncLifecycle(() => import('./notes/notes-detailed-summary.component'), options),
        online: { showAddNote: true },
        offline: { showAddNote: false },
      },
      {
        name: 'visit-note-nav-button',
        slot: 'action-menu-items-slot',
        load: getAsyncLifecycle(() => import('./visit-note-action-button.component'), options),
        order: 1,
      },
      {
        name: 'visit-notes-form-workspace',
        load: getAsyncLifecycle(() => import('./notes/visit-notes-form.component'), options),
        meta: {
          title: {
            key: 'visitNote',
            default: 'Visit Note',
          },
          type: 'visit-note',
        },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS, version };
