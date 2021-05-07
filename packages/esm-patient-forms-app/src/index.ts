import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { backendDependencies } from './openmrs-backend-dependencies';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-patient-forms-app';

  const options = {
    featureName: 'patient-forms',
    moduleName,
  };

  defineConfigSchema(moduleName, {});

  return {
    extensions: [
      {
        id: 'forms-widget',
        slot: 'patient-chart-summary-dashboard-slot',
        load: getAsyncLifecycle(() => import('./forms/forms.component'), options),
        meta: {
          columnSpan: 4,
        },
      },
      {
        id: 'patient-form-entry-workspace',
        load: getAsyncLifecycle(() => import('./forms/form-entry.component'), options),
        meta: {
          title: 'Form Entry',
        },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
