import { useEffect, useMemo, useReducer } from 'react';
import dayjs from 'dayjs';
import { getAppointments } from '../appointments/appointments.resource';
import { Appointment } from '../types';

enum ActionTypes {
  pending = 'pending',
  resolved = 'resolved',
  error = 'error',
}
interface Pending {
  type: ActionTypes.pending;
}

interface Error {
  type: ActionTypes.error;
  payload: Error;
}

interface Resolved {
  type: ActionTypes.resolved;
  payload: Array<Appointment>;
}

type Action = Pending | Error | Resolved;

interface PatientAppointments {
  status: 'pending' | 'resolved' | 'error';
  patientAppointments: Array<Appointment>;
  error?: null | Error;
}

function reducer(state: PatientAppointments, action: Action): PatientAppointments {
  switch (action.type) {
    case ActionTypes.pending:
      return {
        status: 'pending',
        ...state,
      };
    case ActionTypes.resolved:
      return {
        status: 'resolved',
        patientAppointments: action.payload,
        error: null,
      };
    case ActionTypes.error:
      return {
        status: 'error',
        patientAppointments: null,
        error: action.payload,
      };
    default:
      return state;
  }
}

export const useAppointments = (patientUuid: string) => {
  const initialState: PatientAppointments = { status: 'pending', patientAppointments: [] };
  const [{ status, patientAppointments, error }, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (patientUuid) {
      const ac = new AbortController();
      const startDate = dayjs(new Date().toISOString()).subtract(6, 'month').toISOString();
      getAppointments(patientUuid, startDate, ac).then(
        ({ data }) => {
          dispatch({ type: ActionTypes.resolved, payload: data });
        },
        (error) => {
          dispatch({ type: ActionTypes.error, payload: error });
        },
      );
      return () => ac.abort();
    }
  }, [patientUuid]);

  const appointments = useMemo(() => {
    const upcomingAppointments = patientAppointments?.filter((appointment) =>
      dayjs((appointment.startDateTime / 1000) * 1000).isAfter(dayjs()),
    );
    const pastAppointments = patientAppointments?.filter((appointment) =>
      dayjs((appointment.startDateTime / 1000) * 1000).isBefore(dayjs()),
    );
    return { upcomingAppointments, pastAppointments, status, patientAppointments };
  }, [patientAppointments, status]);

  return { ...appointments, error };
};
