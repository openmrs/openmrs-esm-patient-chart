import useSWRImmutable from 'swr/immutable';
import { openmrsFetch } from '@openmrs/esm-framework';
import { allowedExtensionsGlobalProperty } from '../constants';

export interface GlobalProperty {
  uuid: string;
  property: string;
  value: string;
  description: string;
}

/**
 * React hook that takes returns the allowed file extensions
 * @returns String array containing the `allowedExtensions`, `isLoading` loading status, `error`
 */
export const useAllowedExtensions = () => {
  const customRepresentation = 'custom:(uuid,property,value,description)';
  const { data, error, isLoading } = useSWRImmutable<{ data: { results: Array<GlobalProperty> } }>(
    `/ws/rest/v1/systemsetting?&v=${customRepresentation}&q=${allowedExtensionsGlobalProperty}`,
    openmrsFetch,
  );

  const extensions: Array<string> =
    data?.data?.results?.length > 0
      ? data?.data?.results[0].value?.split(',').map<string>((ext) => (ext = '.' + ext))
      : undefined;

  return {
    isLoading,
    allowedExtensions: data?.data?.results?.length > 0 ? data?.data?.results[0].value?.split(',') : undefined,
    error: error,
  };
};
