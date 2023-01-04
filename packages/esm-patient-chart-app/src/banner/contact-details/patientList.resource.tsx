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

function extractRelationshipDatas(patientIdentifier: string, cohortLists: Array<CohortList>): Array<ExtractedList> {
  const relationshipsData = [];
  for (const r of cohortLists) {
    if (patientIdentifier === r.uuid) {
      relationshipsData.push({
        uuid: r.uuid,
        display: r.cohort.display,
      });
    } else {
      relationshipsData.push({
        uuid: r.uuid,
        display: r.cohort.display,
      });
    }
  }
  return relationshipsData;
}

export function usePatientLists(patientUuid: string) {
  const { data, error, isValidating } = useSWR<{ data: PatientListResponse }, Error>(
    `${cohortUrl}/cohortmember?patient=${patientUuid}&v=default`,
    openmrsFetch,
  );
  const formattedRelationships = data?.data?.results?.length
    ? extractRelationshipDatas(patientUuid, data.data.results)
    : null;

  return {
    data: data ? formattedRelationships : null,
    isError: error,
    isLoading: !data && !error,
    isValidating,
  };
}
