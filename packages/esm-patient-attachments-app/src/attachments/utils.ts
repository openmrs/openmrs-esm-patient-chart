import dayjs from 'dayjs';
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

export function createGalleryEntry(data: any) {
  return {
    id: `${data.uuid}`,
    src: `${window.openmrsBase}${attachmentUrl}/${data.uuid}/bytes`,
    thumbnail: `${window.openmrsBase}${attachmentUrl}/${data.uuid}/bytes?view=complexdata.view.thumbnail`,
    // thumbnail: `${window.openmrsBase}${attachmentUrl}/${res.data.uuid}/bytes`,
    // thumbnailWidth: 320,
    // thumbnailHeight: 212,
    thumbnailWidth: 170,
    thumbnailHeight: 130,
    caption: data.comment,
    isSelected: false,
    dateTime: dayjs(data.dateTime).format('YYYY-MM-DD HH:mm:ss'),
    bytesMimeType: data.bytesMimeType,
    bytesContentFamily: data.bytesContentFamily,
  };
}
