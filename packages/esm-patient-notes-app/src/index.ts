import {
  defineConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  messageOmrsServiceWorker,
  restBaseUrl,
  translateFrom,
} from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import notesOverviewComponent from './notes/notes-overview.component';
import visitNotesActionButtonComponent from './visit-note-action-button.component';
import { registerWorkspace } from '@openmrs/esm-patient-common-lib';

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

export const notesOverview = getSyncLifecycle(notesOverviewComponent, options);

export const visitNotesActionButton = getSyncLifecycle(visitNotesActionButtonComponent, options);

// t('visitNoteWorkspaceTitle', 'Visit Note')
export const visitNotesForm = registerWorkspace({
  name: 'visit-notes-form-workspace',
  load: getAsyncLifecycle(() => import('./notes/visit-notes-form.component'), options),
  title: translateFrom(moduleName, 'visitNoteWorkspaceTitle', 'Visit Note'),
  type: 'visit-note',
  canHide: true,
});
