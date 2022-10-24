import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { registerWorkspace } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';

declare var __VERSION__: string;
// __VERSION__ is replaced by Webpack with the version from package.json
const version = __VERSION__;

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
};

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-forms-dashboard-app';
  const options = {
    featureName: 'forms-dashboard',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  registerWorkspace({
    name: 'forms-dashboard-workspace',
    title: 'Forms dashboard',
    load: getAsyncLifecycle(() => import('./forms-dashboard/forms-dashboard.component'), options),
  });

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
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS, version };
