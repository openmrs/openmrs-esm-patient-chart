import { defineConfigSchema, getAsyncLifecycle, messageOmrsServiceWorker } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@openmrs/esm-patient-notes-app';

const options = {
  featureName: 'patient-notes',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/encounter.+',
  });

  defineConfigSchema(moduleName, configSchema);
}

export const notesOverview = () => getAsyncLifecycle(() => import('./notes/notes-overview.component'), options);

export const notesDetailedSummary = () =>
  getAsyncLifecycle(() => import('./notes/notes-detailed-summary.component'), options);

export const visitNotesActionButton = () =>
  getAsyncLifecycle(() => import('./visit-note-action-button.component'), options);

export const visitNotesForm = () => getAsyncLifecycle(() => import('./notes/visit-notes-form.component'), options);
