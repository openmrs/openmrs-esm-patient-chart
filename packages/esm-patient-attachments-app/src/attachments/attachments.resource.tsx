import { openmrsFetch } from '@openmrs/esm-framework';

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

export function createAttachment(
  patientUuid: string,
  content: string,
  fileCaption: string,
  abortController: AbortController,
) {
  const formData = new FormData();
  const emptyFile = new File([''], 'randomfile');
  formData.append('fileCaption', fileCaption);
  formData.append('patient', patientUuid);
  formData.append('file', emptyFile);
  formData.append('base64Content', content);

  return openmrsFetch(`${attachmentUrl}`, {
    method: 'POST',
    signal: abortController.signal,
    body: formData,
  });
}

export function deleteAttachment(attachmentUuid: string, abortController: AbortController) {
  return openmrsFetch(`${attachmentUrl}/${attachmentUuid}`, {
    method: 'DELETE',
    signal: abortController.signal,
  });
}
