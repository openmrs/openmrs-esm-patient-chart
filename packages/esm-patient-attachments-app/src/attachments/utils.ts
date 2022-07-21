import { AttachmentResponse, Attachment } from './attachments-types';
import { attachmentUrl } from './attachments.resource';

export function readFileAsString(file: File) {
  return new Promise<string>((resolve) => {
    if (file) {
      const reader = new FileReader();

      reader.addEventListener('load', () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          resolve('');
        }
      });

      reader.addEventListener('error', () => {
        resolve('');
      });

      reader.readAsDataURL(file);
    } else {
      resolve('');
    }
  });
}

export function createGalleryEntry(data: AttachmentResponse): Attachment {
  return {
    id: data.uuid,
    src: `${window.openmrsBase}${attachmentUrl}/${data.uuid}/bytes`,
    title: data.comment,
    dateTime: data.dateTime,
    bytesMimeType: data.bytesMimeType,
    bytesContentFamily: data.bytesContentFamily,
  };
}
