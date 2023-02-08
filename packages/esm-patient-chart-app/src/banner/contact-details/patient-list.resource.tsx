import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import { FetchResponse, openmrsFetch } from '@openmrs/esm-framework';

export interface CohortList {
  patient: {
    uuid: string;
    display: string;
  };
  startDate: string;
  endDate: string;
  uuid: string;
  voided: boolean;
  attributes: [];
  cohort: {
    uuid: string;
    display: string;
  };
  resourceVersion: string;
}

interface PatientListResponse {
  results: Array<CohortList>;
}

interface ExtractedList {
  uuid: string;
  display: string;
}

function extractPatientListData(cohortLists: Array<CohortList>): Array<ExtractedList> {
  const patientListData = [];
  for (const cohortList of cohortLists) {
    patientListData.push({
      uuid: cohortList.cohort.uuid,
      display: cohortList.cohort.display,
    });
  }
  return patientListData;
}

export function usePatientLists(patientUuid: string) {
  const cohortMemberUrl = '/ws/rest/v1/cohortm/cohortmember';

  const { data, error, isLoading, isValidating } = useSWRImmutable<FetchResponse<PatientListResponse>, Error>(
    `${cohortMemberUrl}?patient=${patientUuid}&v=default`,
    openmrsFetch,
  );
  const formattedPatientLists = useMemo(
    () => (data?.data?.results?.length ? extractPatientListData(data.data.results) : null),
    [data?.data?.results],
  );

  return {
    lists: data ? formattedPatientLists : null,
    isError: error,
    isLoading,
    isValidating,
  };
}
