import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import type { BillableService, PaymentMode } from './types';
import type { ConfiguredBillableService, PaymentManagerConfig } from '../config-schema';

interface RestResults<T> {
  results: T[];
}

/**
 * Billable services come from distro configuration (`billableServices`) because
 * the billing/cashier backend OMOD is not installed. Each configured service is
 * exposed with a single "Default" service price so existing UI keeps working.
 */
export function useBillableServices() {
  const config = useConfig<PaymentManagerConfig>();
  const billableServices: BillableService[] = (config.billableServices ?? []).map((s: ConfiguredBillableService) => ({
    uuid: s.uuid,
    name: s.name,
    serviceStatus: 'ENABLED',
    servicePrices: [{ uuid: `${s.uuid}-default`, name: 'Default', price: s.price ?? 0 }],
  }));
  return { billableServices, error: undefined, isLoading: false, mutate: () => {} };
}

/**
 * Payment modes come from distro configuration (`paymentMethods`).
 */
export function usePaymentModes() {
  const config = useConfig<PaymentManagerConfig>();
  const paymentModes: PaymentMode[] = (config.paymentMethods ?? []).map((name: string) => ({
    uuid: name,
    name,
  }));
  return { paymentModes, error: undefined, isLoading: false };
}

/**
 * Resolve the provider record for a given user uuid. The core `provider` REST
 * resource is part of webservices.rest and is always available.
 */
export function useProviderUuid(userUuid: string | undefined) {
  const url = userUuid ? `${restBaseUrl}/provider?user=${userUuid}&v=custom:(uuid,display)` : null;
  const { data, error, isLoading } = useSWR<{ data: RestResults<{ uuid: string; display: string }> }>(
    url,
    openmrsFetch,
  );
  return { providerUuid: data?.data?.results?.[0]?.uuid, error, isLoading };
}

// Bill creation, payment and listing are handled locally in `local-bill-store`
// (re-exported below) because there is no billing backend to persist to.
export {
  createLocalBill,
  payLocalBill,
  useLocalBills,
  getBillsForPatient,
  getAmountPaidForPatient,
  billTotal,
} from './local-bill-store';
export type { LocalBill, LocalLineItem, LocalBillStatus } from './local-bill-store';
