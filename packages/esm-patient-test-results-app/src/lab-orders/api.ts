import useSWR, { mutate } from 'swr';
import { FetchResponse, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';
import { useCallback, useMemo } from 'react';
import { OrderBasketItem, OrderPost, PatientOrderFetchResponse } from '@openmrs/esm-patient-common-lib';

/**
 * SWR-based data fetcher for patient orders.
 *
 * @param patientUuid The UUID of the patient whose orders should be fetched.
 * @param status Allows fetching either all orders or only active orders.
 */
export function usePatientLabOrders(patientUuid: string, status: 'ACTIVE' | 'any') {
  const { careSettingUuid, labOrderTypeUuid: labOrderTypeUUID } = (useConfig() as ConfigObject).orders;
  const ordersUrl = `/ws/rest/v1/order?patient=${patientUuid}&careSetting=${careSettingUuid}&status=${status}&orderType=${labOrderTypeUUID}`;

  const { data, error, isLoading, isValidating } = useSWR<FetchResponse<PatientOrderFetchResponse>, Error>(
    patientUuid ? ordersUrl : null,
    openmrsFetch,
  );

  const mutateOrders = useCallback(
    () => mutate((key) => typeof key === 'string' && key.startsWith(`/ws/rest/v1/order?patient=${patientUuid}`)),
    [patientUuid],
  );

  const labOrders = useMemo(
    () =>
      data?.data?.results
        ? data.data.results?.sort((order1, order2) => (order2.dateActivated > order1.dateActivated ? 1 : -1))
        : null,
    [data],
  );

  return {
    data: data ? labOrders : null,
    error,
    isLoading,
    isValidating,
    mutate: mutateOrders,
  };
}

export interface LabOrderBasketItem extends OrderBasketItem {
  testType?: {
    label: string;
    conceptUuid: string;
  };
  labReferenceNumber?: string;
  urgency?: string;
  instructions?: string;
}

export function prepLabOrderPostData(order: LabOrderBasketItem, patientUuid: string, encounterUuid: string): OrderPost {
  return {
    action: 'NEW',
    patient: patientUuid,
    type: 'testorder',
    careSetting: order.careSetting,
    orderer: order.orderer,
    encounter: encounterUuid,
    concept: order.testType.conceptUuid,
    instructions: order.instructions,
  };
}
