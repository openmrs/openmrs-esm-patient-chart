import {
  openmrsFetch,
  restBaseUrl,
  type Diagnosis,
  type OpenmrsResource,
  type Visit,
  useOpenmrsInfinite,
  useOpenmrsPagination,
} from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';
import { dedupeDiagnoses } from '../dedupe-diagnoses';

const customRepresentation =
  'custom:(uuid,location,encounters:(uuid,diagnoses:(uuid,display,rank,diagnosis,voided),form:(uuid,display,name,description,encounterType,version,resources:(uuid,display,name,valueReference)),encounterDatetime,orders:full,obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),display,groupMembers:(uuid,concept:(uuid,display),value:(uuid,display),display),value,obsDatetime),encounterType:(uuid,display,viewPrivilege,editPrivilege),encounterProviders:(uuid,display,encounterRole:(uuid,display),provider:(uuid,person:(uuid,display)))),visitType:(uuid,name,display),startDatetime,stopDatetime,patient,attributes:(attributeType:ref,display,uuid,value)';

const encounterCustomRepresentation =
  'custom:(uuid,diagnoses:(uuid,display,rank,diagnosis,voided),form:(uuid,display,name,description,encounterType,version,resources:(uuid,display,name,valueReference)),encounterDatetime,orders:full,obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),display,groupMembers:(uuid,concept:(uuid,display),value:(uuid,display),display),value,obsDatetime),encounterType:(uuid,display,viewPrivilege,editPrivilege),encounterProviders:(uuid,display,encounterRole:(uuid,display),provider:(uuid,person:(uuid,display))))';

/** Response shape from the EMRAPI /patient/{uuid}/visit endpoint */
export interface EmrApiVisitResponse {
  visit: Visit;
  diagnoses: Array<Diagnosis>;
}

/**
 * Fetches visits and diagnoses from the EMRAPI endpoint.
 * Diagnoses are deduped within the hook so consumers don't need to handle it.
 * Pass null for patientUuid to disable fetching.
 */
export function useEmrApiVisits(patientUuid: string | null, pageSize: number = 10) {
  const url = patientUuid
    ? new URL(
        `${window.openmrsBase}${restBaseUrl}/emrapi/patient/${patientUuid}/visit?v=custom:(visit,diagnoses)`,
        window.location.toString(),
      )
    : null;

  const { data, mutate, ...rest } = useOpenmrsPagination<EmrApiVisitResponse>(url, pageSize);

  const visits = useMemo(
    () =>
      data?.map((item) => ({
        visit: item.visit,
        diagnoses: dedupeDiagnoses(item.diagnoses?.filter((diagnosis) => !diagnosis.voided) ?? []),
      })) ?? null,
    [data],
  );

  return { visits, mutate, ...rest };
}

/**
 * On-demand hook to fetch encounters for a specific visit.
 * Only fetches when visitUuid is provided (i.e., when a visit row is expanded).
 */
export function useVisitEncounters(patientUuid: string, visitUuid: string | null) {
  const url = visitUuid
    ? `${restBaseUrl}/encounter?patient=${patientUuid}&visit=${visitUuid}&v=${encounterCustomRepresentation}`
    : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<any> } }>(url, openmrsFetch);

  return {
    encounters: data?.data?.results ?? null,
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

/**
 * Standard paginated visits using the OpenMRS REST API.
 * Pass null for patientUuid to disable fetching.
 */
export function usePaginatedVisits(
  patientUuid: string | null,
  pageSize: number,
  params: Record<string, number | string> = {},
) {
  const url = patientUuid
    ? new URL(
        `${window.openmrsBase}${restBaseUrl}/visit?patient=${patientUuid}&v=${customRepresentation}`,
        window.location.toString(),
      )
    : null;

  if (url) {
    for (const key in params) {
      url.searchParams.set(key, '' + params[key]);
    }
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
