import { openmrsFetch, OpenmrsResource } from '@openmrs/esm-framework';
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

function extractPatientListData(patientIdentifier: string, cohortLists: Array<CohortList>): Array<ExtractedList> {
  const patientListListData = [];
  for (const r of cohortLists) {
    if (patientIdentifier === r.uuid) {
      patientListListData.push({
        uuid: r.cohort.uuid,
        display: r.cohort.display,
      });
    } else {
      patientListListData.push({
        uuid: r.cohort.uuid,
        display: r.cohort.display,
      });
    }
  }
  return patientListListData;
}

export function usePatientLists(patientUuid: string) {
  const { data, error, isValidating } = useSWR<{ data: PatientListResponse }, Error>(
    `${cohortUrl}/cohortmember?patient=${patientUuid}&v=default`,
    openmrsFetch,
  );
  const formattedPatientLists = data?.data?.results?.length
    ? extractPatientListData(patientUuid, data.data.results)
    : null;

  return {
    data: data ? formattedPatientLists : null,
    isError: error,
    isLoading: !data && !error,
    isValidating,
  };
}
