import { useCallback, useMemo } from 'react';
import { chunk } from 'lodash-es';
import useSWR, { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';
import type { OrderPost, PatientOrderFetchResponse, TestOrderPost } from '@openmrs/esm-patient-common-lib';
import {
  type FetchResponse,
  openmrsFetch,
  restBaseUrl,
  showSnackbar,
  toOmrsIsoString,
  useConfig,
} from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import type { TestOrderBasketItem } from '../types';

export const careSettingUuid = '6f0c9a92-6f24-11e3-af88-005056821db0';

/**
 * SWR-based data fetcher for patient orders.
 *
 * @param patientUuid The UUID of the patient whose orders should be fetched.
 * @param status Allows fetching either all orders or only active orders.
 */
export function usePatientLabOrders(patientUuid: string, status: 'ACTIVE' | 'any') {
  const { labOrderTypeUuid: labOrderTypeUUID } = useConfig<ConfigObject>().orders;
  const ordersUrl = `${restBaseUrl}/order?patient=${patientUuid}&careSetting=${careSettingUuid}&status=${status}&orderType=${labOrderTypeUUID}`;
  const { mutate } = useSWRConfig();

  const { data, error, isLoading, isValidating } = useSWR<FetchResponse<PatientOrderFetchResponse>, Error>(
    patientUuid ? ordersUrl : null,
    openmrsFetch,
  );

  const mutateOrders = useCallback(
    () => mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/order?patient=${patientUuid}`)),
    [mutate, patientUuid],
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
  const { data, error, isLoading } = useSWRImmutable<Array<FetchResponse<ConceptReferenceResponse>>, Error>(
    conceptUuids && conceptUuids.length > 0 ? getConceptReferenceUrls(conceptUuids) : null,
    (key: Array<string>) => Promise.all(key.map((url) => openmrsFetch<ConceptReferenceResponse>(url))),
  );

  const ob: ConceptReferenceResponse = data?.reduce((acc, response) => ({ ...acc, ...response.data }), {});
  const orderReasons = ob
    ? Object.values(ob).map((value) => ({
        uuid: value.uuid,
        display: value.display,
      }))
    : [];

  if (error) {
    showSnackbar({
      title: error.name,
      subtitle: error.message,
      kind: 'error',
    });
  }

  return { orderReasons: orderReasons, isLoading };
}

function getConceptReferenceUrls(conceptUuids: Array<string>) {
  return chunk(conceptUuids, 10).map(
    (partition) => `${restBaseUrl}/conceptreferences?references=${partition.join(',')}&v=custom:(uuid,display)`,
  );
}

export function prepTestOrderPostData(
  order: TestOrderBasketItem,
  patientUuid: string,
  encounterUuid: string | null,
): TestOrderPost {
  if (order.action === 'NEW' || order.action === 'RENEW') {
    return {
      action: 'NEW',
      type: 'testorder',
      patient: patientUuid,
      careSetting: careSettingUuid,
      orderer: order.orderer,
      encounter: encounterUuid,
      concept: order.testType.conceptUuid,
      instructions: order.instructions,
      orderReason: order.orderReason,
      accessionNumber: order.accessionNumber,
      urgency: order.urgency,
      scheduledDate: order.scheduledDate ? toOmrsIsoString(order.scheduledDate) : null,
    };
  } else if (order.action === 'REVISE') {
    return {
      action: 'REVISE',
      type: 'testorder',
      patient: patientUuid,
      careSetting: order.careSetting,
      orderer: order.orderer,
      encounter: encounterUuid,
      concept: order.testType.conceptUuid,
      instructions: order.instructions,
      orderReason: order.orderReason,
      previousOrder: order.previousOrder,
      accessionNumber: order.accessionNumber,
      urgency: order.urgency,
      scheduledDate: order.scheduledDate ? toOmrsIsoString(order.scheduledDate) : null,
    };
  } else if (order.action === 'DISCONTINUE') {
    return {
      action: 'DISCONTINUE',
      type: 'testorder',
      patient: patientUuid,
      careSetting: order.careSetting,
      orderer: order.orderer,
      encounter: encounterUuid,
      concept: order.testType.conceptUuid,
      orderReason: order.orderReason,
      previousOrder: order.previousOrder,
      accessionNumber: order.accessionNumber,
      urgency: order.urgency,
      scheduledDate: order.scheduledDate ? toOmrsIsoString(order.scheduledDate) : null,
    };
  } else {
    throw new Error(`Unknown order action: ${order.action}.`);
  }
}

export type PostDataPrepLabOrderFunction = (
  order: TestOrderBasketItem,
  patientUuid: string,
  encounterUuid: string,
) => OrderPost;

export interface ConceptAnswers {
  display: string;
  uuid: string;
}

export interface ConceptReferenceResponse {
  [key: string]: {
    uuid: string;
    display: string;
    datatype: {
      uuid: string;
      display: string;
    };
    answers: Array<ConceptAnswers>;
    setMembers: Array<ConceptAnswers>;
  };
}
