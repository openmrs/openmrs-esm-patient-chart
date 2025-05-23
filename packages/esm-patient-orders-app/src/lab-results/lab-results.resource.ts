import { openmrsFetch, restBaseUrl, type FetchResponse, type OpenmrsResource } from '@openmrs/esm-framework';
import { type Order } from '@openmrs/esm-patient-common-lib';
import useSWR from 'swr';
import { type Encounter, type Observation } from '../types/encounter';
import { type OrderDiscontinuationPayload } from '../types/order';

const labEncounterRepresentation =
  'custom:(uuid,encounterDatetime,encounterType:(uuid,display),location:(uuid,name),patient:(uuid,display,person:(uuid,display,gender,age)),encounterProviders:(uuid,provider:(uuid,name)),obs:(uuid,obsDatetime,voided,groupMembers,formFieldNamespace,formFieldPath,order:(uuid,display),concept:(uuid,name:(uuid,name)),value:(uuid,display,name:(uuid,name),names:(uuid,conceptNameType,name)))';
const labConceptRepresentation =
  'custom:(uuid,display,name,datatype,set,answers,hiNormal,hiAbsolute,hiCritical,lowNormal,lowAbsolute,lowCritical,units,allowDecimal,' +
  'setMembers:(uuid,display,answers,datatype,hiNormal,hiAbsolute,hiCritical,lowNormal,lowAbsolute,lowCritical,units,allowDecimal))';
const conceptObsRepresentation = 'custom:(uuid,display,concept:(uuid,display),groupMembers,value)';

type NullableNumber = number | null | undefined;
export interface LabOrderConcept {
  uuid: string;
  display: string;
  name?: ConceptName;
  datatype: Datatype;
  set: boolean;
  version: string;
  retired: boolean;
  descriptions: Array<Description>;
  mappings?: Array<Mapping>;
  answers?: Array<OpenmrsResource>;
  setMembers?: Array<LabOrderConcept>;
  hiNormal?: NullableNumber;
  hiAbsolute?: NullableNumber;
  hiCritical?: NullableNumber;
  lowNormal?: NullableNumber;
  lowAbsolute?: NullableNumber;
  lowCritical?: NullableNumber;
  allowDecimal?: boolean | null;
  units?: string;
}

export interface ConceptName {
  display: string;
  uuid: string;
  name: string;
  locale: string;
  localePreferred: boolean;
  conceptNameType: string;
}

export interface Datatype {
  uuid: string;
  display: string;
  name: string;
  description: string;
  hl7Abbreviation: string;
  retired: boolean;
  resourceVersion: string;
}

export interface Description {
  display: string;
  uuid: string;
  description: string;
  locale: string;
  resourceVersion: string;
}

export interface Mapping {
  display: string;
  uuid: string;
  conceptReferenceTerm: OpenmrsResource;
  conceptMapType: OpenmrsResource;
  resourceVersion: string;
}

export function useOrderConceptByUuid(uuid: string) {
  const apiUrl = `${restBaseUrl}/concept/${uuid}?v=${labConceptRepresentation}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: LabOrderConcept }, Error>(
    apiUrl,
    openmrsFetch,
  );
  return {
    concept: data?.data,
    isLoading,
    error,
    isValidating,
    mutate,
  };
}

export function useLabEncounter(encounterUuid: string) {
  const apiUrl = `${restBaseUrl}/encounter/${encounterUuid}?v=${labEncounterRepresentation}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<FetchResponse<Encounter>, Error>(
    apiUrl,
    openmrsFetch,
  );

  return {
    encounter: data?.data,
    isLoading,
    error: error,
    isValidating,
    mutate,
  };
}

export function useObservation(obsUuid: string) {
  const url = `${restBaseUrl}/obs/${obsUuid}?v=${conceptObsRepresentation}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: Observation }, Error>(
    obsUuid ? url : null,
    openmrsFetch,
  );
  return {
    data: data?.data,
    isLoading,
    error,
    isValidating,
    mutate,
  };
}

export function useCompletedLabResults(order: Order) {
  const {
    encounter,
    isLoading: isLoadingEncounter,
    mutate: mutateLabOrders,
    error: encounterError,
  } = useLabEncounter(order.encounter.uuid);
  const {
    data: observation,
    isLoading: isLoadingObs,
    error: isErrorObs,
    mutate: mutateObs,
  } = useObservation(encounter?.obs.find((obs) => obs?.concept?.uuid === order?.concept?.uuid)?.uuid ?? '');

  return {
    isLoading: isLoadingEncounter || isLoadingObs,
    completeLabResult: observation,
    mutate: () => {
      mutateLabOrders();
      mutateObs();
    },
    error: isErrorObs ?? encounterError,
  };
}

// TODO: the calls to update order and observations for results should be transactional to allow for rollback
export async function updateOrderResult(
  orderUuid: string,
  encounterUuid: string,
  obsPayload: any,
  fulfillerPayload: any,
  orderPayload: OrderDiscontinuationPayload,
  abortController: AbortController,
) {
  const saveEncounter = await openmrsFetch(`${restBaseUrl}/encounter/${encounterUuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: obsPayload,
  });

  if (saveEncounter.ok) {
    const updateOrderCall = await openmrsFetch(`${restBaseUrl}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: abortController.signal,
      body: orderPayload,
    });

    if (updateOrderCall.status === 201) {
      const fulfillOrder = await openmrsFetch(`${restBaseUrl}/order/${orderUuid}/fulfillerdetails/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortController.signal,
        body: fulfillerPayload,
      });
      return fulfillOrder;
    }
  }
  throw new Error('Failed to update order');
}

export function createObservationPayload(
  concept: LabOrderConcept,
  order: Order,
  values: Record<string, unknown>,
  status: string,
) {
  if (concept.set && concept.setMembers.length > 0) {
    const groupMembers = concept.setMembers
      .map((member) => createGroupMember(member, order, values, status))
      .filter((member) => member !== null && member.value !== null && member.value !== undefined);

    if (groupMembers.length === 0) {
      return { obs: [] };
    }

    return { obs: [createObservation(order, groupMembers, null, status)] };
  } else {
    const value = getValue(concept, values);
    if (value === null || value === undefined) {
      return { obs: [] };
    }
    return { obs: [createObservation(order, null, value, status)] };
  }
}

export function updateObservation(observationUuid: string, payload: Record<string, any>) {
  return openmrsFetch(`${restBaseUrl}/obs/${observationUuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

function createGroupMember(member: LabOrderConcept, order: Order, values: Record<string, unknown>, status: string) {
  const value = getValue(member, values);
  if (value === null || value === undefined) {
    return null;
  }
  return {
    concept: { uuid: member.uuid },
    value: value,
    status: status,
    order: { uuid: order.uuid },
  };
}

function createObservation(order: Order, groupMembers = null, value = null, status: string) {
  return {
    concept: { uuid: order.concept.uuid },
    status: status,
    order: { uuid: order.uuid },
    ...(groupMembers && groupMembers.length > 0 && { groupMembers }),
    ...(value !== null && value !== undefined && { value }),
  };
}

function getValue(concept: LabOrderConcept, values: Record<string, unknown>) {
  const { datatype, uuid } = concept;
  const value = values[uuid];

  if (value === null || value === undefined) {
    return null;
  }

  // hl7Abbreviation is NM for Numeric and ST for Text
  if (['NM', 'ST'].includes(datatype.hl7Abbreviation)) {
    return value;
  }
  // hl7Abbreviation is CWE for Coded with exceptions datatype
  if (datatype.hl7Abbreviation === 'CWE') {
    return { uuid: value };
  }

  return null;
}

export const isCoded = (concept: LabOrderConcept) => concept.datatype?.display === 'Coded';
export const isNumeric = (concept: LabOrderConcept) => concept.datatype?.display === 'Numeric';
export const isPanel = (concept: LabOrderConcept) => concept.setMembers?.length > 0;
export const isText = (concept: LabOrderConcept) => concept.datatype?.display === 'Text';
