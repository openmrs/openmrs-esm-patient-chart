import {
  defineConfigSchema,
  fhirBaseUrl,
  getAsyncLifecycle,
  getSyncLifecycle,
  messageOmrsServiceWorker,
} from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { patientAllergiesFormWorkspace } from './constants';
import { dashboardMeta } from './dashboard.meta';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
  fhir2: '^1.2.0',
};

const frontendDependencies = {
  '@openmrs/esm-framework': process.env.FRAMEWORK_VERSION,
};

function setupOpenMRS() {
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/concept.+',
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/patient/.+/allergy.+',
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${fhirBaseUrl}/AllergyIntolerance.+`,
  });

  const moduleName = '@openmrs/esm-patient-allergies-app';

  const options = {
    featureName: 'patient-allergies',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        id: 'allergies-overview-widget',
        slot: 'patient-chart-summary-dashboard-slot',
        order: 9,
        load: getAsyncLifecycle(() => import('./allergies/allergies-overview.component'), options),
        meta: {
          columnSpan: 4,
        },
        online: { showAddAllergy: true },
        offline: { showAddAllergy: false },
      },
      {
        id: 'allergies-details-widget',
        slot: dashboardMeta.slot,
        load: getAsyncLifecycle(() => import('./allergies/allergies.component'), options),
        meta: {
          columnSpan: 1,
        },
        online: { showAddAllergy: true },
        offline: { showAddAllergy: false },
      },
      {
        id: 'allergies-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        order: 6,
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), options),
        meta: dashboardMeta,
        online: { showAddAllergy: true },
        offline: { showAddAllergy: true },
      },
      {
        id: patientAllergiesFormWorkspace,
        load: getAsyncLifecycle(() => import('./allergies/allergies-form/allergy-form.component'), options),
        meta: {
          title: {
            key: 'recordNewAllergy',
            default: 'Record a new allergy',
          },
        },
      },
    ],
  };
}

export { backendDependencies, frontendDependencies, importTranslation, setupOpenMRS };
