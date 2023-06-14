import { FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { CohortResponse } from '../types';
import { useMemo } from 'react';

export function usePatientListsForPatient(patientUuid: string) {
  const customRepresentation = 'custom:(uuid,patient:ref,cohort:(uuid,name,startDate,endDate))';
  const url = patientUuid ? `ws/rest/v1/cohortm/cohortmember?patient=${patientUuid}&v=${customRepresentation}` : null;
  const { data, isLoading, mutate } = useSWR<FetchResponse<CohortResponse>, Error>(url, openmrsFetch);

  const cohorts = useMemo(
    () =>
      data
        ? data?.data?.results.map((ref) => ({
            uuid: ref.cohort.uuid,
            name: ref.cohort.name,
            startDate: ref.cohort.startDate,
            endDate: ref.cohort.endDate,
          }))
        : null,
    [data],
  );

  return {
    data: cohorts,
    isLoading,
    mutateLists: mutate,
  };
}
