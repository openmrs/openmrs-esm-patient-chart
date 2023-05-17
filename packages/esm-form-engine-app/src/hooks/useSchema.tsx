import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { OHRIFormSchema } from '@openmrs/openmrs-form-engine-lib';

const useSchema = (valueReferenceUuid: string) => {
  const url = `/ws/rest/v1/clobdata/${valueReferenceUuid}`;
  const { data, isLoading, error } = useSWR<{ data: OHRIFormSchema }>(valueReferenceUuid ? url : null, openmrsFetch);

  return { schema: data?.data, isLoadingSchema: isLoading, schemaLoadError: error };
};

export default useSchema;
