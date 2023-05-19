import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { Form } from '../types';

const useForm = (formUuid: string) => {
  const url = `/ws/rest/v1/form/${formUuid}?v=full`;

  const { data, error, isLoading } = useSWR<{ data: Form }>(formUuid ? url : null, openmrsFetch);

  return { form: data?.data, formLoadError: error, isLoadingForm: isLoading };
};

export default useForm;
