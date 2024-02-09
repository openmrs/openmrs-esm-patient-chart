import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { conceptRepresentation, encounterRepresentation, obsRepresentation } from '../constants';

export interface ConceptResponse {
  uuid: string;
  display: string;
  name: Name;
  datatype: Datatype;
  conceptClass: ConceptClass;
  set: boolean;
  version: string;
  retired: boolean;
  names: Name2[];
  descriptions: Description[];
  mappings: Mapping[];
  answers: any[];
  setMembers: ConceptReference[];
  auditInfo: AuditInfo;
  attributes: any[];
  links: Link18[];
  resourceVersion: string;
  hiNormal?: number;
  hiAbsolute?: number;
  hiCritical?: number;
  lowNormal?: number;
  lowAbsolute?: number;
  lowCritical?: number;
  units?: string;
}

export interface Name {
  display: string;
  uuid: string;
  name: string;
  locale: string;
  localePreferred: boolean;
  conceptNameType: string;
  links: Link[];
  resourceVersion: string;
}

export interface Link {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Datatype {
  uuid: string;
  display: string;
  name: string;
  description: string;
  hl7Abbreviation: string;
  retired: boolean;
  links: Link2[];
  resourceVersion: string;
}

export interface Link2 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface ConceptClass {
  uuid: string;
  display: string;
  name: string;
  description: string;
  retired: boolean;
  links: Link3[];
  resourceVersion: string;
}

export interface Link3 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Name2 {
  display: string;
  uuid: string;
  name: string;
  locale: string;
  localePreferred: boolean;
  conceptNameType?: string;
  links: Link4[];
  resourceVersion: string;
}

export interface Link4 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Description {
  display: string;
  uuid: string;
  description: string;
  locale: string;
  links: Link5[];
  resourceVersion: string;
}

export interface Link5 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Mapping {
  display: string;
  uuid: string;
  conceptReferenceTerm: ConceptReferenceTerm;
  conceptMapType: ConceptMapType;
  links: Link8[];
  resourceVersion: string;
}

export interface ConceptReferenceTerm {
  uuid: string;
  display: string;
  links: Link6[];
}

export interface Link6 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface ConceptMapType {
  uuid: string;
  display: string;
  links: Link7[];
}

export interface Link7 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Link8 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface ConceptReference {
  uuid: string;
  display: string;
  name: Name3;
  datatype: Datatype2;
  conceptClass: ConceptClass2;
  set: boolean;
  version: string;
  retired: boolean;
  names: Name4[];
  descriptions: any[];
  mappings: Mapping2[];
  answers: Answer[];
  setMembers: any[];
  attributes: any[];
  links: Link15[];
  resourceVersion: string;
  hiNormal?: number;
  hiAbsolute?: number;
  hiCritical?: number;
  lowNormal?: number;
  lowAbsolute?: number;
  lowCritical?: number;
  units?: string;
}

export interface Name3 {
  display: string;
  uuid: string;
  name: string;
  locale: string;
  localePreferred: boolean;
  conceptNameType: string;
  links: Link9[];
  resourceVersion: string;
}

export interface Link9 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Datatype2 {
  uuid: string;
  display: string;
  links: Link10[];
}

export interface Link10 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface ConceptClass2 {
  uuid: string;
  display: string;
  links: Link11[];
}

export interface Link11 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Name4 {
  uuid: string;
  display: string;
  links: Link12[];
}

export interface Link12 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Mapping2 {
  uuid: string;
  display: string;
  links: Link13[];
}

export interface Link13 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Answer {
  uuid: string;
  display: string;
  links: Link14[];
}

export interface Link14 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Link15 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface AuditInfo {
  creator: Creator;
  dateCreated: string;
  changedBy: ChangedBy;
  dateChanged: string;
}

export interface Creator {
  uuid: string;
  display: string;
  links: Link16[];
}

export interface Link16 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface ChangedBy {
  uuid: string;
  display: string;
  links: Link17[];
}

export interface Link17 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Link18 {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface ObPayload {
  concept: string;
  order: string;
  value: string | number;
  status: string;
}
const baseUrl = '/ws/rest/v1/';

export function fetchEncounter(encounterUuid: string) {
  return openmrsFetch(`${baseUrl}/encounter/${encounterUuid}?v=${encounterRepresentation}`).then(({ data }) => {
    if (data) {
      return data;
    }
    return null;
  });
}

export function fetchObservation(obsUuid: string) {
  return openmrsFetch(`${baseUrl}/obs/${obsUuid}?v=${obsRepresentation}`).then(({ data }) => {
    if (data) {
      return data;
    }
    return null;
  });
}

// get order concept
export async function GetOrderConceptByUuid(uuid: string) {
  const abortController = new AbortController();
  return openmrsFetch(`${baseUrl}concept/${uuid}?v=full`, {
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
  });
}

export function useGetOrderConceptByUuid(uuid: string) {
  const apiUrl = `${baseUrl}concept/${uuid}?v=${conceptRepresentation}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: ConceptResponse }, Error>(
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

export async function UpdateEncounter(uuid: string, payload: any) {
  const abortController = new AbortController();
  return openmrsFetch(`${baseUrl}encounter/${uuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: payload,
  });
}
const addObservation = async (encounterUuid: string, obsPayload: any, abortController: any) => {
  const saveResultObs = await openmrsFetch(`${baseUrl}encounter/${encounterUuid}`, {
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
  const editResultObs = await openmrsFetch(`${baseUrl}obs/${obsUuid}`, {
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
export async function UpdateOrderResult(
  orderUuid: string,
  encounterUuid: string,
  obsUuid: string,
  obsPayload: any,
  fulfillerPayload: any,
) {
  const abortController = new AbortController();
  const saveObs = obsUuid
    ? editObservation(obsUuid, obsPayload, abortController)
    : addObservation(encounterUuid, obsPayload, abortController);

  saveObs.then((obsStatus) => {
    if (obsStatus === 200) {
      return openmrsFetch(`${baseUrl}order/${orderUuid}/fulfillerdetails/`, {
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
