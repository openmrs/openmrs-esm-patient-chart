import { useMemo } from 'react';
import uniqBy from 'lodash-es/uniqBy';
import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { type PatientProgram } from '../types';

const customRepresentation = `custom:(uuid,display,program,dateEnrolled,dateCompleted,location:(uuid,display))`;

export const useActivePatientEnrollments = (patientUuid: string) => {
  const { data, error, isLoading } = useSWR<{ data: { results: Array<PatientProgram> } }>(
    `/ws/rest/v1/programenrollment?patient=${patientUuid}&v=${customRepresentation}`,
    openmrsFetch,
  );

  const activePatientEnrollments = useMemo(
    () =>
      data?.data.results
        .sort((a, b) => (b.dateEnrolled > a.dateEnrolled ? 1 : -1))
        .filter((enrollment) => enrollment.dateCompleted === null) ?? [],
    [data?.data.results],
  );

  return {
    activePatientEnrollments: uniqBy(activePatientEnrollments, (program) => program?.program?.uuid),
    error,
    isLoading,
  };
};
