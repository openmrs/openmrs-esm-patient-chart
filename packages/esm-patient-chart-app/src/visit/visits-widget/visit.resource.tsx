import {
  openmrsFetch,
  restBaseUrl,
  useConfig,
  useOpenmrsInfinite,
  type OpenmrsResource,
  type Visit,
  useOpenmrsPagination,
} from '@openmrs/esm-framework';
import { type ChartConfig } from '../../config-schema';

const customRepresentation =
  'custom:(uuid,location,encounters:(uuid,diagnoses:(uuid,display,rank,diagnosis,voided),form:(uuid,display),encounterDatetime,orders:full,obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),display,groupMembers:(uuid,concept:(uuid,display),value:(uuid,display),display),value,obsDatetime),encounterType:(uuid,display,viewPrivilege,editPrivilege),encounterProviders:(uuid,display,encounterRole:(uuid,display),provider:(uuid,person:(uuid,display)))),visitType:(uuid,name,display),startDatetime,stopDatetime,patient,attributes:(attributeType:ref,display,uuid,value)';

export function useInfiniteVisits(
  patientUuid: string,
  params: Record<string, number | string> = {},
  rep: string = customRepresentation,
) {
  const { numberOfVisitsToLoad } = useConfig<ChartConfig>();

  const url = new URL(
    `${window.openmrsBase}/${restBaseUrl}/visit?patient=${patientUuid}&v=${rep}&limit=${numberOfVisitsToLoad}`,
    window.location.toString(),
  );
  for (const key in params) {
    url.searchParams.set(key, '' + params[key]);
  }

  const { data, ...rest } = useOpenmrsInfinite<Visit>(patientUuid ? url : null);

  return { visits: data, ...rest };
}

export function usePaginatedVisits(
  patientUuid: string,
  pageSize: number,
  params: Record<string, number | string> = {},
) {
  const url = new URL(
    `${window.openmrsBase}/${restBaseUrl}/visit?patient=${patientUuid}&v=${customRepresentation}`,
    window.location.toString(),
  );
  for (const key in params) {
    url.searchParams.set(key, '' + params[key]);
  }
  return useOpenmrsPagination<Visit>(url, pageSize);
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
