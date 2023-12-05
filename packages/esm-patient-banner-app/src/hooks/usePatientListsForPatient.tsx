import { useMemo } from 'react';
import useSWR from 'swr';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { type CohortMemberResponse } from '../types';

export function usePatientListsForPatient(patientUuid: string) {
  const customRepresentation = 'custom:(uuid,patient:ref,cohort:(uuid,name,startDate,endDate))';
  const url = patientUuid ? `ws/rest/v1/cohortm/cohortmember?patient=${patientUuid}&v=${customRepresentation}` : null;
  const { data, isLoading } = useSWR<FetchResponse<CohortMemberResponse>, Error>(url, openmrsFetch);

  const cohorts = data?.data?.results.map((ref) => ({
    uuid: ref.cohort.uuid,
    name: ref.cohort.name,
    startDate: ref.cohort.startDate,
    endDate: ref.cohort.endDate,
  }));

  return useMemo(() => ({ cohorts, isLoading }), [isLoading, cohorts]);
}
