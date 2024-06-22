import useSWRImmutable from 'swr/immutable';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export interface GlobalProperty {
  property: string;
  uuid: string;
  value: string;
}

export function useAllowedFileExtensions() {
  const allowedFileExtensionsGlobalProperty = 'attachments.allowedFileExtensions';
  const customRepresentation = 'custom:(value)';
  const url = `${restBaseUrl}/systemsetting?&v=${customRepresentation}&q=${allowedFileExtensionsGlobalProperty}`;

  const { data, error, isLoading } = useSWRImmutable<{ data: { results: Array<GlobalProperty> } }>(url, openmrsFetch);

  const allowedFileExtensions =
    data?.data?.results?.length > 0 ? data?.data?.results[0].value?.toLowerCase().split(',') || undefined : undefined;

  return {
    allowedFileExtensions,
    error,
    isLoading,
  };
}
