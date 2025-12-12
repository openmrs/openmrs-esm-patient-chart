import { showSnackbar, translateFrom } from '@openmrs/esm-framework';
import { type OrderBasketItem } from './types';

type OrderAction = 'placed' | 'updated' | 'discontinued';

function getNotificationTitle(
  moduleName: string,
  placedOrders: OrderBasketItem[],
  updatedOrders: OrderBasketItem[],
  discontinuedOrders: OrderBasketItem[],
  activeActions: OrderAction[],
): string {
  if (activeActions.length > 1) {
    return translateFrom(moduleName, 'ordersCompleted', 'Orders completed');
  }

  const action = activeActions[0];

  if (action === 'placed') {
    return placedOrders.length === 1
      ? translateFrom(moduleName, 'orderPlaced', 'Order placed')
      : translateFrom(moduleName, 'ordersPlaced', 'Orders placed');
  }

  if (action === 'updated') {
    return updatedOrders.length === 1
      ? translateFrom(moduleName, 'orderUpdated', 'Order updated')
      : translateFrom(moduleName, 'ordersUpdated', 'Orders updated');
  }

  // action === 'discontinued'
  return discontinuedOrders.length === 1
    ? translateFrom(moduleName, 'orderDiscontinued', 'Order discontinued')
    : translateFrom(moduleName, 'ordersDiscontinued', 'Orders discontinued');
}

/**
 * Shows a success toast notification for order operations.
 * The notification title dynamically reflects the action(s) taken (placed, updated, discontinued)
 * and whether it's singular or plural.
 *
 * @param moduleName - The module name (e.g., '@openmrs/esm-patient-orders-app') to use for translations
 * @param patientOrderItems - Array of order basket items that were processed
 */
export function showOrderSuccessToast(moduleName: string, patientOrderItems: OrderBasketItem[]) {
  if (patientOrderItems.length === 0) {
    return;
  }

  const placedOrders = patientOrderItems.filter((item) => ['NEW', 'RENEW'].includes(item.action));
  const updatedOrders = patientOrderItems.filter((item) => item.action === 'REVISE');
  const discontinuedOrders = patientOrderItems.filter((item) => item.action === 'DISCONTINUE');

  const orderedString = placedOrders.map((item) => item.display).join(', ');
  const updatedString = updatedOrders.map((item) => item.display).join(', ');
  const discontinuedString = discontinuedOrders.map((item) => item.display).join(', ');

  const activeActions: OrderAction[] = [
    orderedString && 'placed',
    updatedString && 'updated',
    discontinuedString && 'discontinued',
  ].filter(Boolean) as OrderAction[];

  const title = getNotificationTitle(moduleName, placedOrders, updatedOrders, discontinuedOrders, activeActions);

  const subtitleParts: string[] = [];

  if (orderedString) {
    subtitleParts.push(`${translateFrom(moduleName, 'orderedFor', 'Placed order for')} ${orderedString}.`);
  }

  if (updatedString) {
    subtitleParts.push(`${translateFrom(moduleName, 'updated', 'Updated')} ${updatedString}.`);
  }

  if (discontinuedString) {
    subtitleParts.push(`${translateFrom(moduleName, 'discontinued', 'Discontinued')} ${discontinuedString}.`);
  }

  showSnackbar({
    isLowContrast: true,
    kind: 'success',
    title,
    subtitle: subtitleParts.join(' '),
  });
}
