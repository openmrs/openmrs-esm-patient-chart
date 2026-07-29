/**
 * Stand-in for `@openmrs/esm-patient-common-lib` in the screenshot harness.
 *
 * The pure result helpers are re-exported from their real source so the classification and range
 * formatting shown in the screenshots is the shipped logic. Everything else is the order-basket
 * plumbing the test-order form needs in order to mount.
 */
import React from 'react';

export { assessValue, exist, formatReferenceRange } from '../../packages/esm-patient-common-lib/src/results/helpers';

export const careSettingUuid = '6f0c9a92-6f24-11e3-af88-005056821db0';

export const priorityOptions = [
  { value: 'ROUTINE', label: 'Routine' },
  { value: 'STAT', label: 'Stat' },
  { value: 'ON_SCHEDULED_DATE', label: 'On scheduled date' },
];

export function useOrderBasket() {
  return { orders: [], setOrders: () => {}, clearOrders: () => {} };
}

export function useOrderType() {
  return {
    orderType: { uuid: 'lab-order-type-uuid', display: 'Test order', name: 'Test order', retired: false },
    isLoadingOrderType: false,
    isValidatingOrderType: false,
    errorFetchingOrderType: undefined,
  };
}

export function useMutatePatientOrders() {
  return { mutate: () => {} };
}

export function useReferenceRanges() {
  return { ranges: new Map(), isLoading: false, error: undefined, mutate: () => {} };
}

export function usePatientChartStore() {
  return { patient: null, patientUuid: null, visitContext: null, mutateVisitContext: null };
}

export const postOrder = () => Promise.resolve();
export const showOrderSuccessToast = () => {};

export const EmptyState = () => null;
export const ErrorState = () => null;

export const ExtensionSlot: React.FC<{ name: string }> = () => null;
