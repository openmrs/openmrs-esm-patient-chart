import { type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type OrderBasketItem, type OrderBasketExtensionProps } from '@openmrs/esm-patient-common-lib';

/**
 * Returns the earliest selected start date among basket items, or `now`
 * when no item has a start date set. Used to backdate the encounter created
 * in postOrdersOnNewEncounter so the backend's
 * `dateActivated >= encounterDatetime` constraint holds.
 *
 * Backend visit-bounds enforcement (`Encounter.datetimeShouldBeInVisitDatesRange`)
 * is the posting layer's responsibility — see `postOrdersOnNewEncounter`.
 */
export function getEarliestStartDate(orders: ReadonlyArray<OrderBasketItem>, now: Date = new Date()): Date {
  return orders.reduce<Date>((earliest, order) => {
    const orderWithDates = order as { scheduledDate?: Date | string; startDate?: Date | string };
    const startDateValue = orderWithDates.scheduledDate ?? orderWithDates.startDate;
    if (!startDateValue) {
      return earliest;
    }
    const startDate = startDateValue instanceof Date ? startDateValue : new Date(startDateValue);
    return startDate < earliest ? startDate : earliest;
  }, now);
}

export interface CreateOrderBasketExtensionPropsArguments {
  patient: fhir.Patient;
  drugOrderWorkspaceName?: string;
  labOrderWorkspaceName?: string;
  generalOrderWorkspaceName?: string;
  launchChildWorkspace?: Workspace2DefinitionProps['launchChildWorkspace'];
  visibleOrderPanels?: Array<string>;
}

export function createOrderBasketExtensionProps({
  patient,
  drugOrderWorkspaceName,
  labOrderWorkspaceName,
  generalOrderWorkspaceName,
  launchChildWorkspace,
  visibleOrderPanels,
}: CreateOrderBasketExtensionPropsArguments): OrderBasketExtensionProps {
  const result: OrderBasketExtensionProps = {
    patient,
    visibleOrderPanels,
  };

  if (launchChildWorkspace) {
    if (drugOrderWorkspaceName) {
      result.launchDrugOrderForm = (order: OrderBasketItem) => {
        launchChildWorkspace(drugOrderWorkspaceName, { order });
      };
    }

    if (labOrderWorkspaceName) {
      result.launchLabOrderForm = (orderTypeUuid: string, order: OrderBasketItem) => {
        launchChildWorkspace(labOrderWorkspaceName, { orderTypeUuid, order });
      };
    }

    if (generalOrderWorkspaceName) {
      result.launchGeneralOrderForm = (orderTypeUuid: string, order: OrderBasketItem) => {
        launchChildWorkspace(generalOrderWorkspaceName, { orderTypeUuid, order });
      };
    }
  }

  return result;
}
