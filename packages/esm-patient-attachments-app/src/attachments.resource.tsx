import { useMemo } from 'react';
import useSWR from 'swr';
import { FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { AttachmentResponse, UploadedFile } from './attachments-types';

export const attachmentUrl = '/ws/rest/v1/attachment';

export function getAttachmentByUuid(attachmentUuid: string, abortController: AbortController) {
  return openmrsFetch(`${attachmentUrl}/${attachmentUuid}`, {
    signal: abortController.signal,
  });
}

export function useAttachments(patientUuid: string, includeEncounterless: boolean) {
  const { data, error, mutate, isValidating } = useSWR<FetchResponse<{ results: Array<AttachmentResponse> }>>(
    `${attachmentUrl}?patient=${patientUuid}&includeEncounterless=${includeEncounterless}`,
    openmrsFetch,
  );

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

export async function createAttachment(patientUuid: string, file: UploadedFile) {
  const formData = new FormData();

  formData.append(
    'fileCaption',
    JSON.stringify({
      name: file.fileName,
      description: file.fileDescription,
    }),
  );
  formData.append('patient', patientUuid);

  if (file.file) {
    formData.append('file', file.file, file.fileName);
  } else {
    formData.append('file', new File([''], file.fileName), file.fileName);
    formData.append('base64Content', file.fileContent);
  }
  return openmrsFetch(`${attachmentUrl}`, {
    method: 'POST',
    body: formData,
  });

  // return Promise.resolve(() => console.log(file, emptyFile));
}

export function deleteAttachmentPermanently(attachmentUuid: string, abortController: AbortController) {
  return openmrsFetch(`${attachmentUrl}/${attachmentUuid}`, {
    method: 'DELETE',
    signal: abortController.signal,
  });
}
