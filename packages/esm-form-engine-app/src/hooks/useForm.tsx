import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { Form } from '../types';

const useForm = (formUuid: string) => {
  const { data, error, isLoading } = useSWR<{ data: Form }>(`/ws/rest/v1/form/${formUuid}?v=full`, openmrsFetch);
  return { form: data?.data, error, isLoading };
};

export default useForm;
