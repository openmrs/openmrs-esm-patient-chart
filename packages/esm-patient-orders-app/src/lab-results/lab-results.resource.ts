import useSWR from 'swr';
import {
  type OpenmrsResource,
  openmrsFetch,
  restBaseUrl,
  type FetchResponse,
  useAbortController,
} from '@openmrs/esm-framework';
import { type Encounter } from '../types/encounter';

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
    isError: error,
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
    isError: error,
    isValidating,
    mutate,
  };
}

export function fetchObservation(obsUuid: string) {
  return openmrsFetch(`${restBaseUrl}/obs/${obsUuid}?v=${conceptObsRepresentation}`).then(({ data }) => {
    if (data) {
      return data;
    }
    return null;
  });
}

const addObservation = async (encounterUuid: string, obsPayload: any, abortController: any) => {
  const saveResultObs = await openmrsFetch(`${restBaseUrl}/encounter/${encounterUuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: obsPayload,
  });

  return saveResultObs.status;
};

const editObservation = async (obsUuid: string, obsPayload: any, abortController: any) => {
  const editResultObs = await openmrsFetch(`${restBaseUrl}/obs/${obsUuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: obsPayload,
  });

  return editResultObs.status;
};

//TODO: the calls to update order and observations for results should be transactional to allow for rollback
export async function updateOrderResult(
  orderUuid: string,
  encounterUuid: string,
  obsUuid: string,
  obsPayload: any,
  fulfillerPayload: any,
) {
  const abortController = useAbortController();
  const saveObs = obsUuid
    ? editObservation(obsUuid, obsPayload, abortController)
    : addObservation(encounterUuid, obsPayload, abortController);

  saveObs.then((obsStatus) => {
    if (obsStatus === 200 || obsStatus === 201) {
      return openmrsFetch(`${restBaseUrl}/order/${orderUuid}/fulfillerdetails/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortController.signal,
        body: fulfillerPayload,
      });
    }
    throw new Error('Saving of test results failed');
  });
}
