import {
  defineConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  messageOmrsServiceWorker,
} from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import notesOverviewComponent from './notes/notes-overview.component';
import visitNotesActionButtonComponent from './visit-note-action-button.component';

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

export const notesOverview = getSyncLifecycle(notesOverviewComponent, options);

export const visitNotesActionButton = getSyncLifecycle(visitNotesActionButtonComponent, options);

export const visitNotesForm = getAsyncLifecycle(() => import('./notes/visit-notes-form.component'), options);
