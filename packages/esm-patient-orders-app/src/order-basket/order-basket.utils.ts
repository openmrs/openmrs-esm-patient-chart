import { type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type OrderBasketItem, type OrderBasketExtensionProps } from '@openmrs/esm-patient-common-lib';

/**
 * Returns the earliest startDate among basket items (drug orders), or `now`
 * when no item has a startDate set. Used to backdate the encounter created
 * in postOrdersOnNewEncounter so the backend's
 * `dateActivated >= encounterDatetime` constraint holds.
 *
 * When `visitStartDatetime` is supplied, the returned date is floored to it so
 * the resulting encounterDatetime stays within the visit window (the backend
 * also enforces `Encounter.datetimeShouldBeInVisitDatesRange`).
 */
export function getEarliestStartDate(
  orders: ReadonlyArray<OrderBasketItem>,
  now: Date = new Date(),
  visitStartDatetime?: Date | string,
): Date {
  const earliest = orders.reduce<Date>((acc, order) => {
    const startDateValue = (order as { startDate?: Date | string }).startDate;
    if (!startDateValue) {
      return acc;
    }
    const startDate = startDateValue instanceof Date ? startDateValue : new Date(startDateValue);
    return startDate < acc ? startDate : acc;
  }, now);

  if (visitStartDatetime) {
    const visitStart = visitStartDatetime instanceof Date ? visitStartDatetime : new Date(visitStartDatetime);
    if (earliest < visitStart) {
      return visitStart;
    }
  }
  return earliest;
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
