import { useMemo } from 'react';
import useSWR from 'swr';
import { uniqBy } from 'lodash-es';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type PatientProgram } from '../types';

const customRepresentation = `custom:(uuid,display,program,dateEnrolled,dateCompleted,location:(uuid,display))`;

export const useActivePatientEnrollment = (patientUuid: string) => {
  const { data, error, isLoading } = useSWR<{ data: { results: Array<PatientProgram> } }>(
    `${restBaseUrl}/programenrollment?patient=${patientUuid}&v=${customRepresentation}`,
    openmrsFetch,
  );

  const activePatientEnrollment = useMemo(
    () =>
      data?.data.results
        .sort((a, b) => (b.dateEnrolled > a.dateEnrolled ? 1 : -1))
        .filter((enrollment) => enrollment.dateCompleted === null) ?? [],
    [data?.data.results],
  );

  return {
    activePatientEnrollment: uniqBy(activePatientEnrollment, (program) => program?.program?.uuid),
    error,
    isLoading,
  };
};
