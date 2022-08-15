export interface UploadedFile {
  fileContent: string;
  fileName: string;
  fileType: string;
  fileDescription: string;
  status?: 'uploading' | 'complete';
}

export interface Attachment {
  id: string;
  src: string;
  title: string;
  dateTime: string;
  bytesMimeType: string;
  bytesContentFamily: string;
}
export interface AttachmentResponse {
  bytesContentFamily: string;
  bytesMimeType: string;
  comment: string;
  dateTime: string;
  uuid: string;
}
