import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { dashboardMeta } from './dashboard.meta';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
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
        name: 'medications-details-widget',
        slot: dashboardMeta.slot,
        load: getAsyncLifecycle(() => import('./medications/root-medication-summary'), options),
        meta: {
          columnSpan: 1,
        },
      },
      {
        name: 'active-medications-widget',
        slot: 'patient-chart-summary-dashboard-slot',
        order: 1,
        load: getAsyncLifecycle(() => import('./medications/active-medications.component'), options),
        meta: {
          columnSpan: 4,
        },
        online: { showAddMedications: true },
        offline: { showAddMedications: false },
      },
      {
        name: 'order-basket-workspace',
        load: getAsyncLifecycle(() => import('./medications/root-order-basket'), options),
        meta: {
          title: {
            key: 'orderBasket',
            default: 'Order Basket',
          },
          type: 'order',
        },
      },
      {
        name: 'medications-summary-dashboard',
        slot: 'patient-chart-dashboard-slot',
        order: 3,
        load: getSyncLifecycle(createDashboardLink(dashboardMeta), options),
        meta: dashboardMeta,
      },
      {
        name: 'order-basket-action-menu',
        slot: 'action-menu-items-slot',
        load: getAsyncLifecycle(() => import('./medications-summary/medication-order-action-menu.component'), options),
        order: 0,
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
