import useSWR from 'swr';
import { type OpenmrsResource, openmrsFetch, restBaseUrl, type FetchResponse } from '@openmrs/esm-framework';
import { type Observation, type Encounter } from '../types/encounter';
import { type OrderDiscontinuationPayload } from '../types/order';

const labEncounterRepresentation =
  'custom:(uuid,encounterDatetime,encounterType,location:(uuid,name),' +
  'patient:(uuid,display),encounterProviders:(uuid,provider:(uuid,name)),' +
  'obs:(uuid,obsDatetime,voided,groupMembers,formFieldNamespace,formFieldPath,order:(uuid,display),concept:(uuid,name:(uuid,name)),' +
  'value:(uuid,display,name:(uuid,name),names:(uuid,conceptNameType,name))))';
const labConceptRepresentation =
  'custom:(uuid,display,name,datatype,set,answers,hiNormal,hiAbsolute,hiCritical,lowNormal,lowAbsolute,lowCritical,units,' +
  'setMembers:(uuid,display,answers,datatype,hiNormal,hiAbsolute,hiCritical,lowNormal,lowAbsolute,lowCritical,units))';
const conceptObsRepresentation = 'custom:(uuid,display,concept:(uuid,display),groupMembers,value)';

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
  hiNormal?: number;
  hiAbsolute?: number;
  hiCritical?: number;
  lowNormal?: number;
  lowAbsolute?: number;
  lowCritical?: number;
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

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: Observation }, Error>(url, openmrsFetch);
  return {
    data: data?.data,
    isLoading,
    error,
    isValidating,
    mutate,
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
  const updateOrderCall = await openmrsFetch(`${restBaseUrl}/order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: orderPayload,
  });

  if (updateOrderCall.status === 201) {
    const saveEncounter = await openmrsFetch(`${restBaseUrl}/encounter/${encounterUuid}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: abortController.signal,
      body: obsPayload,
    });

    if (saveEncounter.ok) {
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
