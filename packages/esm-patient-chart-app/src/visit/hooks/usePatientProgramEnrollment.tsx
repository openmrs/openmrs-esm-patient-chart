import useSWR from 'swr';
import { openmrsFetch, OpenmrsResource } from '@openmrs/esm-framework';
import { useMemo } from 'react';
const customRepresentation = `custom:(uuid,display,program,dateEnrolled,dateCompleted,location:(uuid,display))`;

export interface PatientProgram {
  uuid: string;
  display: string;
  patient: OpenmrsResource;
  program: OpenmrsResource;
  dateEnrolled: string;
  dateCompleted: string;
  location: OpenmrsResource;
}

export const useActivePatientEnrollment = (patientUuid: string) => {
  const { data, error } = useSWR<{ data: { results: Array<PatientProgram> } }>(
    `/ws/rest/v1/programenrollment?patient=${patientUuid}&v=${customRepresentation}`,
    openmrsFetch,
  );

  const activePatientEnrollment = useMemo(
    () =>
      data?.data.results
        .sort((a, b) => (b.dateEnrolled > a.dateEnrolled ? 1 : -1))
        .filter((enrollment) => enrollment.dateCompleted === null) ?? [],
    [data?.data.results],
  );

  return { activePatientEnrollment, error, isLoading: !data && !error };
};
