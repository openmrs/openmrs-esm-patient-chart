import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@openmrs/esm-patient-lists-app';
const options = {
  featureName: 'patient-lists',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const patientListsActionMenu = getAsyncLifecycle(
  () => import('./action-button/patient-lists-action-button.extension'),
  options,
);

// t('patientListsWorkspaceTitle', 'Patient Lists')
export const patientListsWorkspace = getAsyncLifecycle(() => import('./workspaces/patient-lists.workspace'), options);

// t('patientListDetailWorkspaceTitle', 'Patient List Details')
export const patientListDetailsWorkspace = getAsyncLifecycle(
  () => import('./workspaces/patient-list-details.workspace'),
  options,
);
