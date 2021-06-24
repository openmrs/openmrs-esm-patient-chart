import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { dashboardMeta } from './dashboard.meta';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
  fhir: '^1.4.2',
};

const frontendDependencies = {
  '@openmrs/esm-framework': process.env.FRAMEWORK_VERSION,
};

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-patient-medications-app';

  const options = {
    featureName: 'patient-medications',
    moduleName,
  };

  defineConfigSchema(moduleName, {});

  return {
    extensions: [
      {
        id: 'medications-details-widget',
        slot: dashboardMeta.slot,
        load: getAsyncLifecycle(() => import('./medications/root-medication-summary'), options),
        meta: {
          columnSpan: 1,
        },
      },
      {
        id: 'active-medications-widget',
        slot: 'patient-chart-summary-dashboard-slot',
        load: getAsyncLifecycle(() => import('./medications/active-medications.component'), options),
        meta: {
          columnSpan: 4,
        },
        online: { showAddMedications: true },
        offline: { showAddMedications: false },
      },
      {
        id: 'order-basket-workspace',
        load: getAsyncLifecycle(() => import('./medications/root-order-basket'), options),
        meta: {
          title: {
            key: 'orderBasket',
            default: 'Order Basket',
          },
        },
      },
      {
        id: 'medications-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), options),
        meta: dashboardMeta,
      },
    ],
  };
}

export { backendDependencies, frontendDependencies, importTranslation, setupOpenMRS };
