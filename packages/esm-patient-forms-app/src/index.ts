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

// The `exported…` names are referenced by other apps' routes.json. They are the same components as
// the patient chart's: all of them take the patient / visit as window props.
export const exportedPatientFormEntryWorkspace = getAsyncLifecycle(
  () => import('./forms/form-entry.workspace'),
  options,
);

export const clinicalFormsWorkspace = getAsyncLifecycle(() => import('./forms/forms-dashboard.workspace'), options);

export const exportedClinicalFormsWorkspace = getAsyncLifecycle(
  () => import('./forms/forms-dashboard.workspace'),
  options,
);

export const clinicalFormActionButton = getAsyncLifecycle(
  () => import('./clinical-form-action-button.component'),
  options,
);
