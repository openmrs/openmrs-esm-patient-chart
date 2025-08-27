import { useEffect } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { type FetchResponse, formatDate, openmrsFetch, parseDate, restBaseUrl } from '@openmrs/esm-framework';

/**
 * Represents a cohort object returned by the OpenMRS Cohort resource https://github.com/openmrs/openmrs-module-cohort#readme.
 */
export interface Cohort {
  attributes: Array<unknown>;
  cohortType: {
    display: string;
    uuid: string;
  };
  description: string;
  display: string;
  endDate?: string | null;
  groupCohort: boolean | null;
  isStarred?: boolean;
  links: Array<Record<string, string>>;
  location: Location | null;
  name: string;
  resourceVersion: string;
  size: number;
  startDate: string | null;
  type: string;
  uuid: string;
  voided: boolean;
  voidReason: string | null;
}

export interface CohortResponse<T> {
  results: Array<T>;
  error: any;
  totalCount: number;
}

export interface CohortMember {
  attributes: Array<unknown>;
  cohort: Cohort;
  display: string;
  endDate: string | null;
  patient: {
    uuid: string;
    identifiers: [
      {
        display: string;
        uuid: string;
        identifier: string;
      },
    ];
    person: {
      uuid: string;
      display: string;
      gender: string;
      age: string;
    };
  };
  startDate: string;
  uuid: string;
  voided: boolean;
}

export interface CohortType {
  display: string;
  uuid: string;
}

export interface MappedList {
  attributes: Array<unknown>;
  description: string;
  id: string;
  name: string;
  size: number;
  startDate: string;
  type: string;
}

export interface MappedListMembers {
  identifier: string;
  membershipUuid: string;
  name: string;
  sex: string;
  startDate: string;
  patientUuid: string;
}

export interface OpenmrsCohort {
  uuid: string;
  resourceVersion: string;
  name: string;
  description: string;
  attributes: Array<any>;
  links: Array<any>;
  location: Location | null;
  groupCohort: boolean | null;
  startDate: string | null;
  endDate: string | null;
  voidReason: string | null;
  voided: boolean;
  isStarred?: boolean;
  type?: string;
  size: number;
  cohortType?: CohortType;
}

interface PatientListResponse {
  results: CohortResponse<OpenmrsCohort>;
  links: Array<{ rel: 'prev' | 'next' }>;
  totalCount: number;
}

/**
 * Fetches patient lists from the OpenMRS Cohort resource.
 * @returns An object containing the patient lists, loading state, and error state.
 */

export function usePatientLists() {
  const custom = 'custom:(uuid,name,description,display,size,attributes,cohortType,startDate,endDate)';
  const query: Array<[string, string]> = [
    ['v', custom],
    ['totalCount', 'true'],
  ];

  const params = query.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');

  const getUrl = (pageIndex, previousPageData: FetchResponse<PatientListResponse>) => {
    if (pageIndex && !previousPageData?.data?.links?.some((link) => link.rel === 'next')) {
      return null;
    }

    let url = `${restBaseUrl}/cohortm/cohort?${params}`;

    if (pageIndex) {
      url += `&startIndex=${pageIndex * 50}`;
    }

    return url;
  };

  const {
    data,
    error,
    mutate,
    isValidating,
    isLoading,
    size: pageNumber,
    setSize,
  } = useSWRInfinite<FetchResponse<PatientListResponse>, Error>(getUrl, openmrsFetch);

  useEffect(() => {
    if (data && data?.[pageNumber - 1]?.data?.links?.some((link) => link.rel === 'next')) {
      setSize((currentSize) => currentSize + 1);
    }
  }, [data, pageNumber, setSize]);

  // Map the properties to match the MappedList interface
  const mapProperties = (cohort: OpenmrsCohort) => ({
    attributes: cohort.attributes,
    description: cohort.description,
    id: cohort.uuid,
    name: cohort.name,
    size: cohort.size,
    startDate: cohort.startDate || '',
    type: cohort.cohortType?.display || '',
  });

  const patientLists = (data?.flatMap((res) => res?.data?.results ?? []) ?? []).map(mapProperties);

  return {
    patientLists,
    isLoading,
    error,
    mutate,
    isValidating,
  };
}

/**
 * Fetches members of a patient list from the OpenMRS Cohort resource.
 * @param listUuid - The UUID of the patient list to fetch members for.
 * @param searchQuery - The search query to filter the members by.
 * @param startIndex - The index of the first member to fetch.
 * @param pageSize - The number of members to fetch.
 * @returns An object containing the members of the patient list, loading state, and error state.
 */
export function usePatientListMembers(listUuid: string, searchQuery = '', startIndex = '', pageSize = '') {
  const listMembersUrl = `${restBaseUrl}/cohortm/cohortmember?`;

  const urlSearchParams = new URLSearchParams({
    cohort: listUuid,
    startIndex,
    limit: pageSize,
    q: searchQuery,
    v: 'full',
  });

  const { data, error, isLoading } = useSWR<{ data: { results: Array<CohortMember> } }, Error>(
    listUuid ? listMembersUrl + urlSearchParams : null,
    openmrsFetch,
  );

  // Map the properties of the fetched members to a simpler object.
  const mapProperties = (listMember) => ({
    identifier: listMember?.patient?.identifiers[0]?.identifier ?? null,
    membershipUuid: listMember?.uuid,
    name: listMember?.patient?.person?.display,
    sex: listMember?.patient?.person?.gender,
    startDate: formatDate(parseDate(listMember?.startDate)),
    patientUuid: `${listMember?.patient?.uuid}`,
  });

  const listMembers: Array<MappedListMembers> = data?.data?.results ? data.data.results.map(mapProperties) : [];

  return {
    listMembers,
    isLoading,
    error,
  };
}
