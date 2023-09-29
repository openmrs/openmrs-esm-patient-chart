import useSWR from 'swr';

import { openmrsFetch } from '@openmrs/esm-framework';
import { OHRIFormSchema } from '@openmrs/openmrs-form-engine-lib';

/**
 * Custom hook to fetch form schema based on its form UUID.
 *
 * @param formUuid - The UUID of the form to retrieve the schema for
 * @returns An object containing the form schema, error, and loading state
 */
const useFormSchema = (formUuid: string) => {
  const url = formUuid ? `/ws/rest/v1/o3/forms/${formUuid}` : null;

  const { data, error, isLoading } = useSWR<{ data: OHRIFormSchema }>(url, openmrsFetch);

  return { schema: data?.data, error, isLoading };
};

export default useFormSchema;
