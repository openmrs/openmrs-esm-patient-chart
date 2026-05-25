import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export interface GlobalProperty {
  property: string;
  uuid: string;
  value: string;
}

/**
 * Fetches the list of file extensions allowed for patient attachments.
 * The allowed extensions are configured via the OpenMRS global property
 * `attachments.allowedFileExtensions` (e.g. "jpg,png,pdf,docx").
 *
 * Uses SWR immutable because this global property is a deployment-level configuration
 * that doesn't change during a user session — fetching it once per session is sufficient.
 *
 * @returns
 * - `allowedFileExtensions` — lowercase array of allowed extensions (e.g. ["jpg", "png"]),
 *   or `undefined` if the global property is not configured (allow all)
 */
export function useAllowedFileExtensions() {
  const allowedFileExtensionsGlobalProperty = 'attachments.allowedFileExtensions';
  const customRepresentation = 'custom:(value)';
  const url = `${restBaseUrl}/systemsetting?&v=${customRepresentation}&q=${allowedFileExtensionsGlobalProperty}`;

  const { data, error, isLoading } = useSWRImmutable<{ data: { results: Array<GlobalProperty> } }>(url, openmrsFetch);

  const allowedFileExtensions = useMemo(() => {
    return data?.data?.results?.length > 0
      ? data?.data?.results[0].value?.toLowerCase().split(',') || undefined
      : undefined;
  }, [data]);

  return {
    allowedFileExtensions,
    error,
    isLoading,
  };
}
