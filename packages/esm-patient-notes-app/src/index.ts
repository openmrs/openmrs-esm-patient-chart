import {
  defineConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  messageOmrsServiceWorker,
  restBaseUrl,
} from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import notesOverviewExtension from './notes/notes-overview.extension';
import visitNotesActionButtonExtension from './visit-note-action-button.extension';

const moduleName = '@openmrs/esm-patient-notes-app';

const options = {
  featureName: 'patient-notes',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${restBaseUrl}/encounter.+`,
  });

  defineConfigSchema(moduleName, configSchema);
}

export const notesOverview = getSyncLifecycle(notesOverviewExtension, options);

export const visitNotesActionButton = getSyncLifecycle(visitNotesActionButtonExtension, options);

// t('visitNoteWorkspaceTitle', 'Visit Note')
export const visitNotesFormWorkspace = getAsyncLifecycle(() => import('./notes/visit-notes-form.workspace'), options);
