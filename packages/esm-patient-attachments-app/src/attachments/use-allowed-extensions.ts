import useSWRImmutable from 'swr/immutable';
import { openmrsFetch } from '@openmrs/esm-framework';

export interface GlobalProperty {
  uuid: string;
  property: string;
  value: string;
}

/**
 * Global property created by the openmrs-module-attachment
 */
const allowedExtensionsGlobalProperty: string = 'attachments.allowedFileExtensions';

/**
 * React hook that takes returns the allowed file extensions
 * @returns String array containing the `allowedExtensions`, `isLoading` loading status, `error`
 */
export const useAllowedExtensions = () => {
  const customRepresentation = 'custom:(value)';
  const { data, error, isLoading } = useSWRImmutable<{ data: { results: Array<GlobalProperty> } }>(
    `/ws/rest/v1/systemsetting?&v=${customRepresentation}&q=${allowedExtensionsGlobalProperty}`,
    openmrsFetch,
  );

  return {
    isLoading,
    allowedExtensions:
      data?.data?.results?.length > 0 ? data?.data?.results[0].value?.toLowerCase().split(',') || undefined : undefined,
    error: error,
  };
};
