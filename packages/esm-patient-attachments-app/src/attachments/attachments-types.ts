export interface UploadedFile {
  fileContent: string;
  fileName: string;
  fileType: 'image' | 'pdf';
  fileDescription: string;
}
