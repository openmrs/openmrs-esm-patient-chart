import { UploadedFile } from '../attachments-types';
import { FetchResponse } from '@openmrs/esm-framework';

export interface CameraMediaUploaderContextType {
  multipleFiles?: boolean;
  collectCaption?: boolean;
  saveFile?: (file: UploadedFile) => Promise<FetchResponse<any>>;
  closeModal?: () => void;
  onCompletion?: () => void;
  filesToUpload?: Array<UploadedFile>;
  setFilesToUpload?: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  filesUploading?: boolean;
  setFilesUploading?: React.Dispatch<React.SetStateAction<boolean>>;
  clearData?: () => void;
  handleTakePhoto?: (fileBlob: string) => void;
  cameraOnly?: boolean;
  error?: Error;
  setError?: React.Dispatch<React.SetStateAction<Error>>;
}
