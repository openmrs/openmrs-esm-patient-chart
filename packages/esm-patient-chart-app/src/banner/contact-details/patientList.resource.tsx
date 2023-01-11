import { openmrsFetch, OpenmrsResource } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';

export const cohortUrl = '/ws/rest/v1/cohortm';
export interface CohortList {
  patient: {
    uuid: string;
    display: string;
    links: [
      {
        rel: string;
        uri: string;
        resourceAlias: string;
      },
    ];
  };
  startDate: string;
  endDate: string;
  uuid: string;
  voided: boolean;
  attributes: [];
  cohort: {
    uuid: string;
    display: string;
    links: [
      {
        rel: string;
        uri: string;
        resourceAlias: string;
      },
    ];
  };
  links: [
    {
      rel: string;
      uri: string;
      resourceAlias: string;
    },
    {
      rel: string;
      uri: string;
      resourceAlias: string;
    },
  ];
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
  const patientListListData = [];
  for (const r of cohortLists) {
    patientListListData.push({
      uuid: r.cohort.uuid,
      display: r.cohort.display,
    });
  }
  return patientListListData;
}

export function usePatientLists(patientUuid: string) {
  const { data, error, isValidating } = useSWR<{ data: PatientListResponse }, Error>(
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
