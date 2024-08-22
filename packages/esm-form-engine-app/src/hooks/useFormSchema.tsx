import useSWR from 'swr';

import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type FormSchema } from '@openmrs/esm-form-engine-lib';

/**
 * Custom hook to fetch form schema based on its form UUID.
 *
 * @param formUuid - The UUID of the form to retrieve the schema for
 * @returns An object containing the form schema, error, and loading state
 */
const useFormSchema = (formUuid: string) => {
  const url = formUuid ? `${restBaseUrl}/o3/forms/${formUuid}` : null;

  const { data, error, isLoading } = useSWR<{ data: FormSchema }>(url, openmrsFetch);

  const schema = { ...data?.data, encounterType: data?.data.encounterType['uuid'] };

  return { schema, error, isLoading };
};

export default useFormSchema;
