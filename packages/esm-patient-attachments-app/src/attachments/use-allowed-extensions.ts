import useSWRImmutable from 'swr/immutable';
import { openmrsFetch } from '@openmrs/esm-framework';

export interface GlobalProperty {
  uuid: string;
  property: string;
  value: string;
}

/**
 * React hook that returns the allowed file extensions from the global property
 * @returns String array containing the `allowedExtensions`, `isLoading` loading status, `error`
 */
export const useAllowedExtensions = () => {
  // Global property from the attachments backend module https://github.com/openmrs/openmrs-module-attachments/blob/master/api/src/main/java/org/openmrs/module/attachments/AttachmentsConstants.java that contains the allowed file extensions
  const allowedExtensionsGlobalProperty: string = 'attachments.allowedFileExtensions';
  const customRepresentation = 'custom:(value)';
  const url = `/ws/rest/v1/systemsetting?&v=${customRepresentation}&q=${allowedExtensionsGlobalProperty}`;

  const { data, error, isLoading } = useSWRImmutable<{ data: { results: Array<GlobalProperty> } }>(url, openmrsFetch);

  const allowedExtensions =
    data?.data?.results?.length > 0 ? data?.data?.results[0].value?.toLowerCase().split(',') || undefined : undefined;

  return {
    allowedExtensions,
    error,
    isLoading,
  };
};
