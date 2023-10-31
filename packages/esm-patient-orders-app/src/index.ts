import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { registerWorkspace } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-patient-orders-app';

const options = {
  featureName: 'patient-orders',
  moduleName,
};

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

registerWorkspace({
  name: 'order-basket',
  title: 'Order Basket',
  load: getAsyncLifecycle(() => import('./order-basket/order-basket.workspace'), options),
  type: 'order',
  canHide: true,
  preferredWindowSize: 'maximized',
});

export const orderBasketActionMenu = getAsyncLifecycle(
  () => import('./order-basket-action-button/order-basket-action-button.extension'),
  options,
);
