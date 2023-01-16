import { FetchResponse, openmrsFetch, OpenmrsResource } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';

export const cohortUrl = '/ws/rest/v1/cohortm';
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
  const { data, error, isValidating } = useSWRImmutable<FetchResponse<PatientListResponse>, Error>(
    `${cohortUrl}/cohortmember?patient=${patientUuid}&v=default`,
    openmrsFetch,
  );
  const formattedPatientLists = useMemo(
    () => (data?.data?.results?.length ? extractPatientListData(data.data.results) : null),
    [data?.data?.results],
  );

  return {
    data: data ? formattedPatientLists : null,
    isError: error,
    isLoading: !data && !error,
    isValidating,
  };
}
