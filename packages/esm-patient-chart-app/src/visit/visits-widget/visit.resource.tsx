import {
  openmrsFetch,
  restBaseUrl,
  type OpenmrsResource,
  type Visit,
  useOpenmrsInfinite,
  useOpenmrsPagination,
} from '@openmrs/esm-framework';
import useSWR from 'swr';

const customRepresentation =
  'custom:(uuid,location,encounters:(uuid,diagnoses:(uuid,display,rank,diagnosis,voided),form:(uuid,display,name,description,encounterType,version,resources:(uuid,display,name,valueReference)),encounterDatetime,orders:full,obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),display,groupMembers:(uuid,concept:(uuid,display),value:(uuid,display),display),value,obsDatetime),encounterType:(uuid,display,viewPrivilege,editPrivilege),encounterProviders:(uuid,display,encounterRole:(uuid,display),provider:(uuid,person:(uuid,display)))),visitType:(uuid,name,display),startDatetime,stopDatetime,patient,attributes:(attributeType:ref,display,uuid,value)';

/**
 * Lightweight visit hook that fetches only basic visit details, diagnoses, and notes.
 * Used for the initial UI load to improve performance.
 * Uses the custom emrapi endpoint introduced in EA-207.
 */
export function useLightweightVisits(patientUuid: string, pageSize: number = 10) {
  const url = patientUuid
    ? new URL(`${window.openmrsBase}${restBaseUrl}/emrapi/patient/${patientUuid}/visit`, window.location.toString())
    : null;

  const { data, mutate, ...rest } = useOpenmrsPagination<LightweightVisit>(url, pageSize);

  return { visits: data, mutate, ...rest };
}

/**
 * On-demand hook to fetch full visit details (encounters, obs, orders, etc.)
 * Only fetches when visitUuid is provided (i.e., when user clicks Tests/Medications/Encounters tabs).
 */
export function useFullVisit(visitUuid: string | null) {
  const url = visitUuid ? `${restBaseUrl}/visit/${visitUuid}?v=${customRepresentation}` : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: Visit }>(url, openmrsFetch);

  return {
    visit: data?.data ?? null,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

export function useInfiniteVisits(
  patientUuid: string,
  params: Record<string, number | string> = {},
  rep: string = customRepresentation,
) {
  const url = new URL(
    `${window.openmrsBase}${restBaseUrl}/visit?patient=${patientUuid}&v=${rep}`,
    window.location.toString(),
  );
  for (const key in params) {
    url.searchParams.set(key, '' + params[key]);
  }

  const { data, mutate, ...rest } = useOpenmrsInfinite<Visit>(patientUuid ? url : null);

  return { visits: data, mutate, ...rest };
}

export function usePaginatedVisits(
  patientUuid: string,
  pageSize: number,
  params: Record<string, number | string> = {},
) {
  const url = new URL(
    `${window.openmrsBase}${restBaseUrl}/visit?patient=${patientUuid}&v=${customRepresentation}`,
    window.location.toString(),
  );
  for (const key in params) {
    url.searchParams.set(key, '' + params[key]);
  }

  const ret = useOpenmrsPagination<Visit>(url, pageSize);

  return ret;
}

export function deleteVisit(visitUuid: string) {
  return openmrsFetch(`${restBaseUrl}/visit/${visitUuid}`, {
    method: 'DELETE',
  });
}

export function restoreVisit(visitUuid: string) {
  return openmrsFetch<Visit>(`${restBaseUrl}/visit/${visitUuid}`, {
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
    body: { voided: false },
  });
}

// ============ Types ============

export interface LightweightVisit {
  uuid: string;
  startDatetime: string;
  stopDatetime: string | null;
  visitType: {
    uuid: string;
    name: string;
    display: string;
  };
  location: OpenmrsResource;
  patient: OpenmrsResource;
  diagnoses: Diagnosis[];
  notes: LightweightNote[];
}

export interface LightweightNote {
  uuid: string;
  display: string;
  value: string;
  obsDatetime: string;
  provider?: {
    uuid: string;
    display: string;
  };
}

export interface Order {
  uuid: string;
  action?: string | null;
  autoExpireDate?: Date | null;
  dateActivated: string;
  dateStopped?: Date | null;
  fulfillerStatus?: string | null;
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
  orderer: OpenmrsResource;
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
