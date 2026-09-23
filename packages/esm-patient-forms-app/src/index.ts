import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@openmrs/esm-patient-forms-app';

const options = {
  featureName: 'patient-forms',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const patientFormEntryWorkspace = getAsyncLifecycle(() => import('./forms/form-entry.workspace'), options);

export const exportedPatientFormEntryWorkspace = getAsyncLifecycle(
  () => import('./forms/exported-form-entry.workspace'),
  options,
);

export const clinicalFormsWorkspace = getAsyncLifecycle(() => import('./forms/forms-dashboard.workspace'), options);

export const exportedClinicalFormsWorkspace = getAsyncLifecycle(
  () => import('./forms/exported-forms-dashboard.workspace'),
  options,
);

export const clinicalFormActionButton = getAsyncLifecycle(
  () => import('./clinical-form-action-button.component'),
  options,
);
