import { openmrsFetch } from '@openmrs/esm-framework';
/**
 * Fetches form schema data from OpenMRS for the given value reference UUIDs.
 *
 * @param {Array<string>} valueReferenceUuids - An array of value reference UUIDs to fetch form schema data for.
 * @returns {Promise<Array<Object>>} - A Promise that resolves to an array of form schema data objects.
 */
export const fetchFormSchema = async (valueReferenceUuids: Array<string>) => {
  const clobDataUrls = valueReferenceUuids.map((valueReferenceUuid) => `/ws/rest/v1/clobdata/${valueReferenceUuid}`);
  const response = await Promise.all(clobDataUrls.map((url) => openmrsFetch(url)));
  return response?.map((res) => res.data);
};

/**
 * Fetches form data from OpenMRS for the given form UUIDs.
 *
 * @param {Array<string>} formUuids - An array of form UUIDs to fetch form data for.
 * @returns {Promise<Array<OHRIFormSchema>>} - A Promise that resolves to an array of form schema data objects.
 */
export const fetchForm = async (formUuids: Array<string>) => {
  const urls = formUuids.map((formUuid) => `/ws/rest/v1/form?q=${formUuid}&&v=custom:(uuid,name,resources)`);
  const response = await Promise.all(urls.map((url) => openmrsFetch(url)));
  const valueReferenceUuids = response
    ?.map((res) => res.data?.results)
    .flat()
    .map((res) => res.resources.find((resource) => resource.name === 'JSON schema')?.['valueReference']);
  return await fetchFormSchema(valueReferenceUuids);
};
