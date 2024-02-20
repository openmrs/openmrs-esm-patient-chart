import {
  defineConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  registerFeatureFlag,
  translateFrom,
} from '@openmrs/esm-framework';
import { createDashboardLink, registerWorkspace } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import orderBasketActionMenuComponent from './order-basket-action-button/order-basket-action-button.extension';
import { ordersDashboardMeta } from './dashboard.meta';
import OrdersSummary from './orders-summary/orders-summary.component';
import { testResultsFormWorkspace } from './constants';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-patient-orders-app';

const options = {
  featureName: 'patient-orders',
  moduleName,
};

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);

  registerWorkspace({
    name: 'patient-orders-form-workspace',
    // t('orderCancellation','Order cancellation')
    title: translateFrom(moduleName, 'orderCancellation', 'Order cancellation'),
    load: getAsyncLifecycle(() => import('./order-cancellation-form/cancel-order-form.component'), options),
    type: 'order',
    canHide: false,
  });
}

// t('orderBasketWorkspaceTitle', 'Order Basket')
registerWorkspace({
  name: 'order-basket',
  title: translateFrom(moduleName, 'orderBasketWorkspaceTitle', 'Order Basket'),
  load: getAsyncLifecycle(() => import('./order-basket/order-basket.workspace'), options),
  type: 'order',
  canHide: true,
});
registerWorkspace({
  name: testResultsFormWorkspace,
  title: 'Enter Test Results',
  load: getAsyncLifecycle(() => import('../src/results/result-form.component'), options),
  type: 'results',
  canHide: true,
});

registerFeatureFlag(
  'ordersSummary',
  'Orders Summary',
  'This feature introduces a navigation on the patient chart left nav called Orders and shows a history of patient orders within patient chart',
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
