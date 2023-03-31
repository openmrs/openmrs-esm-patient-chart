import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { OHRIFormSchema } from '@ohri/openmrs-ohri-form-engine-lib';

const useSchema = (valueReferenceUuid: string) => {
  const { data, isLoading, error } = useSWR<{ data: OHRIFormSchema }>(
    valueReferenceUuid ? `/ws/rest/v1/clobdata/${valueReferenceUuid}` : null,
    openmrsFetch,
  );
  return { schema: data?.data, isLoading, error };
};

export default useSchema;
