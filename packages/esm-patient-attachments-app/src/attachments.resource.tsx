import { useMemo } from 'react';
import useSWR from 'swr';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { type AttachmentResponse, type UploadedFile } from './attachments-types';

export const attachmentUrl = '/ws/rest/v1/attachment';

export function getAttachmentByUuid(attachmentUuid: string, abortController: AbortController) {
  return openmrsFetch(`${attachmentUrl}/${attachmentUuid}`, {
    signal: abortController.signal,
  });
}

export function useAttachments(patientUuid: string, includeEncounterless: boolean) {
  const { data, error, mutate, isLoading, isValidating } = useSWR<
    FetchResponse<{ results: Array<AttachmentResponse> }>
  >(`${attachmentUrl}?patient=${patientUuid}&includeEncounterless=${includeEncounterless}`, openmrsFetch);

  const results = useMemo(
    () => ({
      isLoading,
      data: data?.data.results ?? [],
      error,
      mutate,
      isValidating,
    }),
    [data, error, isLoading, isValidating, mutate],
  );

  return results;
}

export function getAttachments(patientUuid: string, includeEncounterless: boolean, abortController: AbortController) {
  return openmrsFetch(`${attachmentUrl}?patient=${patientUuid}&includeEncounterless=${includeEncounterless}`, {
    signal: abortController.signal,
  });
}

export async function createAttachment(patientUuid: string, fileToUpload: UploadedFile) {
  const formData = new FormData();

  formData.append('fileCaption', fileToUpload.fileName);
  formData.append('patient', patientUuid);

  if (fileToUpload.file) {
    formData.append('file', fileToUpload.file);
  } else {
    formData.append('file', new File([''], fileToUpload.fileName), fileToUpload.fileName);
    formData.append('base64Content', fileToUpload.base64Content);
  }
  return openmrsFetch(`${attachmentUrl}`, {
    method: 'POST',
    body: formData,
  });
}

export function deleteAttachmentPermanently(attachmentUuid: string, abortController: AbortController) {
  return openmrsFetch(`${attachmentUrl}/${attachmentUuid}`, {
    method: 'DELETE',
    signal: abortController.signal,
  });
}
