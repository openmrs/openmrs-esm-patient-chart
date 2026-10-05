import { attachmentUrl } from '@openmrs/esm-framework';

/** The URL that serves an attachment's file, given the uuid of its obs. */
export function getAttachmentBytesUrl(attachmentUuid: string) {
  return `${window.openmrsBase}${attachmentUrl}/${attachmentUuid}/bytes`;
}
