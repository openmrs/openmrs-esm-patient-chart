import useSWRImmutable from 'swr/immutable';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

/** The upload limit in MB enforced by the attachments module. */
export function useMaxAttachmentFileSize() {
  const property = 'attachments.maxUploadFileSize';
  const url = `${restBaseUrl}/systemsetting?q=${property}&v=custom:(property,value)`;
  const { data, error, isLoading, isValidating, mutate } = useSWRImmutable<{
    data: { results: Array<{ property: string; value: string }> };
  }>(url, openmrsFetch);
  const setting = data?.data.results.find((setting) => setting.property === property)?.value;
  const value = setting?.trim() ? Number(setting) : NaN;
  const maxFileSize = Number.isFinite(value) && value >= 0 ? value : undefined;

  return {
    maxFileSize,
    error,
    isLoading,
    isValidating,
    retry: () => mutate().catch(() => undefined),
  };
}
