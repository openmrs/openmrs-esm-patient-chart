import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
  fhir2: '^1.2.0',
};

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-patient-immunizations-app';

  const options = {
    featureName: 'patient-immunizations',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        name: 'immunization-overview-widget',
        slot: 'patient-chart-summary-dashboard-slot',
        order: 10,
        load: getAsyncLifecycle(() => import('./immunizations/immunizations-overview.component'), options),
        meta: {
          columnSpan: 4,
        },
      },
      {
        name: 'immunization-details-widget',
        slot: dashboardMeta.slot,
        load: getAsyncLifecycle(() => import('./immunizations/immunizations-detailed-summary.component'), options),
        meta: {
          columnSpan: 1,
        },
      },
      {
        name: 'immunization-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        order: 8,
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), options),
        meta: dashboardMeta,
      },
      {
        name: 'immunization-form-workspace',
        load: getAsyncLifecycle(() => import('./immunizations/immunizations-form.component'), options),
        meta: {
          title: 'Immunization Form',
        },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
