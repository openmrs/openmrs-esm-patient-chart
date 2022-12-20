import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';

declare var __VERSION__: string;
// __VERSION__ is replaced by Webpack with the version from package.json
const version = __VERSION__;

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
  fhir2: '^1.2.0',
};

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-patient-conditions-app';

  const options = {
    featureName: 'patient-conditions',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        name: 'conditions-overview-widget',
        slot: 'patient-chart-summary-dashboard-slot',
        order: 6,
        load: getAsyncLifecycle(() => import('./conditions/conditions-overview.component'), options),
        meta: {
          columnSpan: 4,
        },
      },
      {
        name: 'conditions-details-widget',
        slot: dashboardMeta.slot,
        load: getAsyncLifecycle(() => import('./conditions/conditions-detailed-summary.component'), options),
        meta: {
          columnSpan: 4,
        },
      },
      {
        name: 'conditions-widget',
        load: getAsyncLifecycle(() => import('./conditions/conditions-widget.component'), options),
        meta: {},
      },
      {
        name: 'conditions-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        order: 7,
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), options),
        meta: dashboardMeta,
      },
      {
        name: 'conditions-form-workspace',
        load: getAsyncLifecycle(() => import('./conditions/conditions-form.component'), options),
        meta: {
          title: 'Record a Condition',
        },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS, version };
