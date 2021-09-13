import { useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { getAppointments } from '../appointments/appointments.resource';
import { Appointment } from '../types';

export const useAppointments = (patientUuid: string) => {
  const [patientAppointments, setPatientAppointments] = useState<Array<Appointment>>([]);
  const [error, setError] = useState<Error>(null);
  const [status, setStatus] = useState<'pending' | 'resolved' | 'error'>('pending');

  useEffect(() => {
    if (patientUuid) {
      const ac = new AbortController();
      const startDate = dayjs(new Date().toISOString()).subtract(6, 'month').toISOString();
      getAppointments(patientUuid, startDate, ac).then(
        ({ data }) => {
          setPatientAppointments(data);
          setStatus('resolved');
        },
        (error) => {
          setError(error);
          setStatus('error');
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
