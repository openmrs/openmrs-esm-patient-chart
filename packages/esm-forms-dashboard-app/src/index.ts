import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
  fhir2: '^1.2.0',
};

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-forms-dashboard-app';

  const options = {
    featureName: 'forms-dashboard',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        name: 'form-action-menu-item',
        slot: 'action-menu-items-slot',
        load: getAsyncLifecycle(
          () => import('./clinical-form-action-button/clinical-form-action-button.component'),
          options,
        ),
        order: 2,
      },
      {
        name: 'forms-dashboard-workspace',
        load: getAsyncLifecycle(() => import('./forms-dashboard/forms-dashboard.component'), options),
        meta: {
          title: {
            key: 'formsDashboard',
            default: 'Forms Dashboard',
          },
          type: 'forms-dashboard',
        },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
