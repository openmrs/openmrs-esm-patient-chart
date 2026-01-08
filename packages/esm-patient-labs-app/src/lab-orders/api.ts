import { useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import useSWRImmutable from 'swr/immutable';
import { type FetchResponse, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { type OrderBasketItem, type OrderPost, type PatientOrderFetchResponse } from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from '../config-schema';

export const careSettingUuid = '6f0c9a92-6f24-11e3-af88-005056821db0';

/**
 * SWR-based data fetcher for patient orders.
 *
 * @param patientUuid The UUID of the patient whose orders should be fetched.
 * @param status Allows fetching either all orders or only active orders.
 */
export function usePatientLabOrders(patientUuid: string, status: 'ACTIVE' | 'any') {
  const { labOrderTypeUuid: labOrderTypeUUID } = (useConfig() as ConfigObject).orders;
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

export function useOrderReasons(conceptUuids: Array<string>) {
  const shouldFetch = !!conceptUuids?.length;
  const referenceUrls = useMemo(
    () => (shouldFetch ? getConceptReferenceUrls(conceptUuids) : []),
    [conceptUuids, shouldFetch],
  );

  const fetchConceptReferences = useCallback(async () => {
    const responses = await Promise.all(
      referenceUrls.map((relativeUrl) => openmrsFetch<ConceptReferencesResult>(`/ws/rest/v1/${relativeUrl}`)),
    );

    return responses.flatMap((response) =>
      Object.values(response.data ?? {}).map((value) => ({
        uuid: value.uuid,
        display: value.display,
      })),
    );
  }, [referenceUrls]);

  const { data, error, isLoading } = useSWRImmutable<Array<ConceptReferenceOption>, Error>(
    shouldFetch ? ['conceptReferences', ...referenceUrls] : null,
    fetchConceptReferences,
  );
  return { orderReasons: data ?? [], isLoading, error };
}

export interface LabOrderBasketItem extends OrderBasketItem {
  testType?: {
    label: string;
    conceptUuid: string;
  };
  labReferenceNumber?: string;
  orderReason?: string;
}

export function prepLabOrderPostData(order: LabOrderBasketItem, patientUuid: string, encounterUuid: string): OrderPost {
  return {
    action: 'NEW',
    patient: patientUuid,
    type: 'testorder',
    careSetting: careSettingUuid,
    orderer: order.orderer,
    encounter: encounterUuid,
    concept: order.testType.conceptUuid,
    instructions: order.instructions,
    orderReason: order.orderReason,
  };
}

const chunkSize = 10;
export function getConceptReferenceUrls(conceptUuids: Array<string>) {
  const accumulator = [];
  for (let i = 0; i < conceptUuids.length; i += chunkSize) {
    accumulator.push(conceptUuids.slice(i, i + chunkSize));
  }

  return accumulator.map((partition) => `conceptreferences?references=${partition.join(',')}&v=custom:(uuid,display)`);
}

export type PostDataPrepLabOrderFunction = (
  order: LabOrderBasketItem,
  patientUuid: string,
  encounterUuid: string,
) => OrderPost;

export interface ConceptReferenceOption {
  uuid: string;
  display: string;
}

export type ConceptReferencesResult = Record<string, ConceptReferenceOption>;
