import { FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';
import { AttachmentResponse, UploadedFile } from './attachments-types';

export const attachmentUrl = '/ws/rest/v1/attachment';

export function getAttachmentByUuid(attachmentUuid: string, abortController: AbortController) {
  return openmrsFetch(`${attachmentUrl}/${attachmentUuid}`, {
    signal: abortController.signal,
  });
}

export function useAttachments(patientUuid: string, includeEncounterless: boolean) {
  console.log('fetching', `${attachmentUrl}?patient=${patientUuid}&includeEncounterless=${includeEncounterless}`);
  const { data, error, mutate, isValidating } = useSWR<FetchResponse<{ results: Array<AttachmentResponse> }>>(
    `${attachmentUrl}?patient=${patientUuid}&includeEncounterless=${includeEncounterless}`,
    openmrsFetch,
  );

  console.log(data);

  const results = useMemo(
    () => ({
      isLoading: !data && !error,
      data: data?.data.results ?? [],
      error,
      mutate,
      isValidating,
    }),
    [isValidating, data, error, mutate],
  );

  return results;
}

export function getAttachments(patientUuid: string, includeEncounterless: boolean, abortController: AbortController) {
  return openmrsFetch(`${attachmentUrl}?patient=${patientUuid}&includeEncounterless=${includeEncounterless}`, {
    signal: abortController.signal,
  });
}

export function createAttachment(patientUuid: string, file: UploadedFile) {
  const formData = new FormData();
  const emptyFile = new File([''], file.fileName);
  formData.append('fileCaption', file.fileName);
  formData.append('patient', patientUuid);
  formData.append('file', emptyFile);
  formData.append('base64Content', file.fileContent);
  console.log('saving file', file);

  return openmrsFetch(`${attachmentUrl}`, {
    method: 'POST',
    body: formData,
  });
}

export function deleteAttachment(attachmentUuid: string, abortController: AbortController) {
  return openmrsFetch(`${attachmentUrl}/${attachmentUuid}`, {
    method: 'DELETE',
    signal: abortController.signal,
  });
}
