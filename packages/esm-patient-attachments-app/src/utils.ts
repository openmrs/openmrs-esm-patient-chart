import { type Attachment, type AttachmentResponse, attachmentUrl, formatDate } from '@openmrs/esm-framework';

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

export interface AttachmentTableData extends Attachment {
  dateTimeValue: string;
}

export function createGalleryEntry(data: AttachmentResponse): AttachmentTableData {
  return {
    id: data.uuid,
    src: `${window.openmrsBase}${attachmentUrl}/${data.uuid}/bytes`,
    filename: data.filename.replace(/\.[^\\/.]+$/, ''),
    description: data.comment,
    dateTimeValue: data.dateTime,
    dateTime: formatDate(new Date(data.dateTime), {
      mode: 'wide',
    }),
    bytesMimeType: data.bytesMimeType,
    bytesContentFamily: data.bytesContentFamily,
  };
}
