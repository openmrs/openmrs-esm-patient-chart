import { openmrsFetch } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';

const useSchema = (valueReferenceUuid: string) => {
  const { data, error, isLoading } = useSWRImmutable(
    valueReferenceUuid ? `/ws/rest/v1/clobdata/${valueReferenceUuid}` : null,
    openmrsFetch,
  );

  return {
    schema: data?.data ?? {},
    isLoading,
    error,
  };
};

export default useSchema;
