import { useState, useEffect, useMemo, useReducer } from 'react';
import { getAppointmentServiceAll } from '../appointments/appointments.resource';
import { Service } from '../types';

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
  payload: Array<Service>;
}

type Action = Pending | Error | Resolved;

interface ServicePayload {
  status: 'pending' | 'resolved' | 'error';
  services: Array<Service>;
  error?: null | Error;
}

function reducer(state: ServicePayload, action: Action): ServicePayload {
  switch (action.type) {
    case ActionTypes.pending:
      return {
        status: 'pending',
        ...state,
      };
    case ActionTypes.resolved:
      return {
        status: 'resolved',
        services: action.payload,
        error: null,
      };
    case ActionTypes.error:
      return {
        status: 'error',
        services: null,
        error: action.payload,
      };
    default:
      return state;
  }
}

const useAppointmentService = () => {
  const initialState: ServicePayload = { status: 'pending', services: [], error: null };
  const [{ status, services, error }, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const ac = new AbortController();
    getAppointmentServiceAll(ac).then(
      ({ data }) => {
        dispatch({ type: ActionTypes.resolved, payload: data });
      },
      (error) => {
        dispatch({ type: ActionTypes.error, payload: error });
      },
    );
  }, []);

  return useMemo(() => {
    return { status, services, error };
  }, [error, services, status]);
};

export default useAppointmentService;
