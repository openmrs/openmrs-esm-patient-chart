import useSWR from 'swr';
import { useMemo } from 'react';
import { Service } from '../types';
import { openmrsFetch } from '@openmrs/esm-framework';

const useAppointmentService = () => {
  const { data, error } = useSWR<{ data: Array<Service> }, Error>(
    '/ws/rest/v1/appointmentService/all/full',
    openmrsFetch,
  );

  return { data, error };
};

export default useAppointmentService;
