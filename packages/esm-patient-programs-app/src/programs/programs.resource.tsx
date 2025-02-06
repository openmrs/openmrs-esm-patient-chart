import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { ProgramWorkflowState, PatientProgram, Program, ProgramsFetchResponse } from '../types';
import uniqBy from 'lodash-es/uniqBy';
import filter from 'lodash-es/filter';
import includes from 'lodash-es/includes';
import map from 'lodash-es/map';

export const customRepresentation = `custom:(uuid,display,program,dateEnrolled,dateCompleted,location:(uuid,display),states:(startDate,endDate,voided,state:(uuid,concept:(display))))`;

export function useEnrollments(patientUuid: string) {
  const enrollmentsUrl = `${restBaseUrl}/programenrollment?patient=${patientUuid}&v=${customRepresentation}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: ProgramsFetchResponse }, Error>(
    patientUuid ? enrollmentsUrl : null,
    openmrsFetch,
  );

  const formattedEnrollments =
    data?.data?.results.length > 0
      ? data?.data.results.sort((a, b) => (b.dateEnrolled > a.dateEnrolled ? 1 : -1))
      : null;

  const activeEnrollments = formattedEnrollments?.filter((enrollment) => !enrollment.dateCompleted);

  return {
    data: data ? uniqBy(formattedEnrollments, (program) => program?.program?.uuid) : null,
    error,
    isLoading,
    isValidating,
    activeEnrollments,
    mutateEnrollments: mutate,
  };
}

export function useAvailablePrograms(enrollments?: Array<PatientProgram>) {
  const { data, error, isLoading } = useSWR<{ data: { results: Array<Program> } }, Error>(
    `${restBaseUrl}/program?v=custom:(uuid,display,allWorkflows,concept:(uuid,display))`,
    openmrsFetch,
  );

  const availablePrograms = data?.data?.results ?? null;

  const eligiblePrograms = filter(
    availablePrograms,
    (program) => !includes(map(enrollments, 'program.uuid'), program.uuid),
  );

  return {
    data: availablePrograms,
    error,
    isLoading,
    eligiblePrograms,
  };
}

export function createProgramEnrollment(payload, abortController) {
  if (!payload) {
    return null;
  }
  const { program, patient, dateEnrolled, dateCompleted, location, states } = payload;
  return openmrsFetch(`${restBaseUrl}/programenrollment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: { program, patient, dateEnrolled, dateCompleted, location, states },
    signal: abortController.signal,
  });
}

export function updateProgramEnrollment(programEnrollmentUuid: string, payload, abortController) {
  if (!payload && !payload.program) {
    return null;
  }
  const { dateEnrolled, dateCompleted, location, states } = payload;
  return openmrsFetch(`${restBaseUrl}/programenrollment/${programEnrollmentUuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: { dateEnrolled, dateCompleted, location, states },
    signal: abortController.signal,
  });
}

export function deleteProgramEnrollment(programEnrollmentUuid: string) {
  const abortController = new AbortController();
  return openmrsFetch(`${restBaseUrl}/programenrollment/${programEnrollmentUuid}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
  });
}

export const usePrograms = (patientUuid: string) => {
  const {
    data: enrollments,
    error: enrollError,
    isLoading: enrolLoading,
    isValidating,
    activeEnrollments,
  } = useEnrollments(patientUuid);
  const { data: availablePrograms, eligiblePrograms } = useAvailablePrograms(enrollments);

  const status = { isLoading: enrolLoading, error: enrollError };
  return {
    enrollments,
    ...status,
    isValidating,
    activeEnrollments,
    availablePrograms,
    eligiblePrograms,
  };
};

export const findLastState = (states: ProgramWorkflowState[]): ProgramWorkflowState => {
  const activeStates = states.filter((state) => !state.voided);
  const ongoingState = activeStates.find((state) => !state.endDate);

  if (ongoingState) {
    return ongoingState;
  }

  return activeStates.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];
};
