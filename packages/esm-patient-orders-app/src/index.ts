import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, translateFrom } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import orderBasketActionMenuComponent from './order-basket-action-button/order-basket-action-button.extension';
import { ordersDashboardMeta } from './dashboard.meta';
import OrdersSummary from './orders-summary/orders-summary.component';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-patient-orders-app';

const options = {
  featureName: 'patient-orders',
  moduleName,
};

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

// t('orderBasketWorkspaceTitle', 'Order Basket')
export const orderBasketWorkspace = getAsyncLifecycle(() => import('./order-basket/order-basket.workspace'), options);

// t('orderCancellation','Order cancellation')
export const patientOrdersFormWorkspace = getAsyncLifecycle(
  () => import('./order-cancellation-form/cancel-order-form.component'),
  options,
);

// t('enterTestResults', 'Enter test results')
export const testResultsFormWorkspace = getAsyncLifecycle(
  () => import('./lab-results/lab-results-form.component'),
  options,
);

export const orderBasketActionMenu = getSyncLifecycle(orderBasketActionMenuComponent, options);

export const ordersDashboardLink =
  // t('Orders', 'Orders')
  getSyncLifecycle(
    createDashboardLink({
      ...ordersDashboardMeta,
      moduleName,
    }),
    options,
  );

export const ordersDashboard = getSyncLifecycle(OrdersSummary, options);
