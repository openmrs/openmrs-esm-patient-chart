import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { registerWorkspace } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';

import patientListsActionButtonComponent from './action-button/patient-lists-action-button.extension';

const moduleName = '@openmrs/esm-patient-lists-app';
const options = {
  featureName: 'patient-lists',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);

  registerWorkspace({
    name: 'patient-lists',
    title: 'Patient Lists',
    load: getAsyncLifecycle(() => import('./workspaces/patient-lists.workspace'), options),
    type: 'patient-lists',
    canHide: false,
    width: 'wider',
  });

  registerWorkspace({
    name: 'patient-list-details',
    title: 'Patient List Details',
    load: getAsyncLifecycle(() => import('./workspaces/patient-list-details.workspace'), options),
    type: 'patient-list-details',
    canHide: false,
    width: 'wider',
  });
}

export const patientListsActionMenu = getSyncLifecycle(patientListsActionButtonComponent, options);

export const patientListDetailsWorkspace = getAsyncLifecycle(
  () => import('./workspaces/patient-list-details.workspace'),
  options,
);
