import { useMemo } from 'react';
import useSWR from 'swr';
import { uniqBy } from 'lodash-es';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type PatientProgram } from '../types';

const customRepresentation = `custom:(uuid,display,program,dateEnrolled,dateCompleted,location:(uuid,display))`;

/**
 * Fetches all active (not completed) program enrollments for a patient.
 * De-duplicates by program UUID using lodash `uniqBy` because the OpenMRS API can
 * occasionally return duplicate entries when a patient has been enrolled and re-enrolled
 * in the same program — `uniqBy` keeps only the most recent enrollment (the one that
 * appears first after sorting by `dateEnrolled` descending).
 *
 * This hook is used by care plan widgets and the patient summary to show which
 * programs a patient is currently enrolled in without showing outdated records.
 */
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
