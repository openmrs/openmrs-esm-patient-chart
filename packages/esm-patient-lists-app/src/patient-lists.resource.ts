import useSWR from 'swr';
import { formatDate, openmrsFetch, parseDate, restBaseUrl } from '@openmrs/esm-framework';

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

/**
 * Fetches patient lists from the OpenMRS Cohort resource.
 * @returns An object containing the patient lists, loading state, and error state.
 */
export function usePatientLists() {
  // Custom representation of the cohort object to fetch only the required properties.
  const customRepresentation = `custom:(uuid,name,description,display,size,attributes,cohortType,startDate,endDate)`;

  const listsUrl = `${restBaseUrl}/cohortm/cohort?`;

  const urlSearchParams = new URLSearchParams({
    v: customRepresentation,
    totalCount: 'true',
  });

  const { data, error, isLoading } = useSWR<{ data: { results: Array<Cohort> } }, Error>(
    listsUrl + urlSearchParams,
    openmrsFetch,
  );

  // Map the properties of the fetched patient lists to a simpler object.
  const mapProperties = (cohort: Cohort): MappedList => ({
    attributes: cohort.attributes,
    description: cohort.description,
    id: cohort.uuid,
    name: cohort.name,
    size: cohort.size,
    startDate: cohort.startDate,
    type: cohort.cohortType.display,
  });

  const patientLists = data?.data?.results ? data.data.results.map(mapProperties) : [];

  return {
    patientLists,
    isLoading,
    error,
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
