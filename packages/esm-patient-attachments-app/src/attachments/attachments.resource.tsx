import { openmrsFetch } from '@openmrs/esm-framework';
import { Dispatch, SetStateAction, useCallback } from 'react';
import { UploadedFile } from './attachments-types';

export const attachmentUrl = '/ws/rest/v1/attachment';

export function getAttachmentByUuid(attachmentUuid: string, abortController: AbortController) {
  return openmrsFetch(`${attachmentUrl}/${attachmentUuid}`, {
    signal: abortController.signal,
  });
}

export function getAttachments(patientUuid: string, includeEncounterless: boolean, abortController: AbortController) {
  return openmrsFetch(`${attachmentUrl}?patient=${patientUuid}&includeEncounterless=${includeEncounterless}`, {
    signal: abortController.signal,
  });
}

export function createAttachment(patientUuid: string, file: UploadedFile) {
  const formData = new FormData();
  const emptyFile = new File([''], file.fileName);
  formData.append('fileCaption', file.fileDescription);
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
