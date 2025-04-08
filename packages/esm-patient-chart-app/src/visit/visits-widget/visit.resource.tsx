import {
  openmrsFetch,
  restBaseUrl,
  useConfig,
  useOpenmrsInfinite,
  type Obs,
  type OpenmrsResource,
  type Privilege,
  type Visit,
  makeUrl,
  useOpenmrsPagination,
} from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type ChartConfig } from '../../config-schema';

const customRepresentation =
  'custom:(uuid,location,encounters:(uuid,diagnoses:(uuid,display,rank,diagnosis,voided),form:(uuid,display),encounterDatetime,orders:full,obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),display,groupMembers:(uuid,concept:(uuid,display),value:(uuid,display),display),value,obsDatetime),encounterType:(uuid,display,viewPrivilege,editPrivilege),encounterProviders:(uuid,display,encounterRole:(uuid,display),provider:(uuid,person:(uuid,display)))),visitType:(uuid,name,display),startDatetime,stopDatetime,patient,attributes:(attributeType:ref,display,uuid,value)';

export function useInfiniteVisits(patientUuid: string) {
  const { numberOfVisitsToLoad } = useConfig<ChartConfig>();

  const url = `${restBaseUrl}/visit?patient=${patientUuid}&v=${customRepresentation}&limit=${numberOfVisitsToLoad}`;
  const { data, ...rest } = useOpenmrsInfinite<Visit>(patientUuid ? url : null);

  return { visits: data, ...rest };
}

export function usePaginatedVisits(patientUuid: string, pageSize: number) {
  const url = new URL(
    makeUrl(`${restBaseUrl}/visit?patient=${patientUuid}&v=${customRepresentation}`),
    window.location.toString(),
  );
  return useOpenmrsPagination<Visit>(url, pageSize);
}

export function useEncounters(patientUuid: string) {
  const endpointUrl = `${restBaseUrl}/encounter`;
  // setting this up to make it more generic and usable later
  const params = {
    patient: patientUuid,
    v: 'default',
    limit: '100',
    order: 'desc',
    startIndex: '0',
  };
  const fullRequest =
    endpointUrl +
    '?' +
    Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Array<Record<string, unknown>> } }, Error>(
    fullRequest,
    openmrsFetch,
  );

  return {
    encounters: data ? data?.data?.results : null,
    error,
    isLoading,
    isValidating,
  };
}

export function deleteVisit(visitUuid: string) {
  return openmrsFetch(`${restBaseUrl}/visit/${visitUuid}`, {
    method: 'DELETE',
  });
}

export function restoreVisit(visitUuid: string) {
  return openmrsFetch(`${restBaseUrl}/visit/${visitUuid}`, {
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
    body: { voided: false },
  });
}

export function mapEncounters(visit: Visit): MappedEncounter[] {
  return visit?.encounters?.map((encounter) => ({
    id: encounter?.uuid,
    datetime: encounter?.encounterDatetime,
    encounterType: encounter?.encounterType?.display,
    editPrivilege: encounter?.encounterType?.editPrivilege?.display,
    form: encounter?.form,
    obs: encounter?.obs,
    visitUuid: visit?.uuid,
    visitType: visit?.visitType?.display,
    visitTypeUuid: visit?.visitType?.uuid,
    visitStartDatetime: visit?.startDatetime,
    visitStopDatetime: visit?.stopDatetime,
    provider:
      encounter?.encounterProviders?.length > 0 ? encounter.encounterProviders[0].provider?.person?.display : '--',
  }));
}

export interface MappedEncounter {
  id: string;
  datetime: string;
  encounterType: string;
  editPrivilege: string;
  form: OpenmrsResource;
  obs: Array<Obs>;
  provider: string;
  visitUuid: string;
  visitType: string;
  visitTypeUuid?: string;
  visitStartDatetime?: string;
  visitStopDatetime?: string;
}

export interface Encounter {
  uuid: string;
  diagnoses: Array<Diagnosis>;
  encounterDatetime: string;
  encounterProviders: Array<EncounterProvider>;
  encounterType: {
    uuid: string;
    display: string;
    viewPrivilege?: Privilege;
    editPrivilege?: Privilege;
  };
  obs: Array<Obs>;
  orders?: Array<Order>;
  form: OpenmrsResource;
  patient: OpenmrsResource;
}

export interface EncounterProvider {
  uuid: string;
  display: string;
  encounterRole: {
    uuid: string;
    display: string;
  };
  provider: {
    uuid: string;
    person?: {
      uuid: string;
      display: string;
    };
  };
}

export interface Order {
  uuid: string;
  dateActivated: string;
  dateStopped?: Date | null;
  dose: number;
  dosingInstructions: string | null;
  dosingType?: 'org.openmrs.FreeTextDosingInstructions' | 'org.openmrs.SimpleDosingInstructions';
  doseUnits: {
    uuid: string;
    display: string;
  };
  drug: {
    uuid: string;
    name: string;
    strength: string;
    display: string;
  };
  duration: number;
  durationUnits: {
    uuid: string;
    display: string;
  };
  frequency: {
    uuid: string;
    display: string;
  };
  numRefills: number;
  orderNumber: string;
  orderReason: string | null;
  orderReasonNonCoded: string | null;
  orderer: {
    uuid: string;
    person: {
      uuid: string;
      display: string;
    };
  };
  orderType: {
    uuid: string;
    display: string;
  };
  route: {
    uuid: string;
    display: string;
  };
  quantity: number;
  quantityUnits: OpenmrsResource;
}

export interface Note {
  concept: OpenmrsResource;
  note: string;
  provider: {
    name: string;
    role: string;
  };
  time: string;
}

export interface OrderItem {
  order: Order;
  provider: {
    name: string;
    role: string;
  };
}

export interface Diagnosis {
  certainty: string;
  display: string;
  encounter: OpenmrsResource;
  links: Array<any>;
  patient: OpenmrsResource;
  rank: number;
  resourceVersion: string;
  uuid: string;
  voided: boolean;
  diagnosis: {
    coded: {
      display: string;
    };
  };
}
