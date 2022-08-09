import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { UploadedFile } from '../attachments-types';
import { FetchResponse, showToast } from '@openmrs/esm-framework';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';
import { useTranslation } from 'react-i18next';
import CameraComponent from './camera.component';
import styles from './camera-media-uploader.scss';
import { Tabs, Tab } from 'carbon-components-react';
import MediaUploaderComponent from './media-uploader.component';
import FilePreviewContainer from './file-preview.component';
import UploadingStatusComponent from './uploading-status.component';

interface CameraMediaUploaderModalProps {
  multipleFiles?: boolean;
  cameraOnly?: boolean;
  collectCaption?: boolean;
  saveFile: (file: UploadedFile) => Promise<FetchResponse<any>>;
  closeModal: () => void;
  onCompletion?: () => void;
}

const CameraMediaUploaderModal: React.FC<CameraMediaUploaderModalProps> = ({
  cameraOnly,
  multipleFiles,
  collectCaption,
  saveFile,
  closeModal,
  onCompletion,
}) => {
  const [error, setError] = useState<Error>(undefined);
  const [filesToUpload, setFilesToUpload] = useState<Array<UploadedFile>>([]);
  const [uploadFilesToServer, setUploadFilesToServer] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (error) {
      showToast({
        description: error.message,
        kind: 'error',
        title: t('cameraError', 'Camera Error'),
      });
    }
  }, [error, t]);

  const handleTakePhoto = useCallback((file: string) => {
    setFilesToUpload([
      {
        fileContent: file,
        fileName: 'Image taken from camera',
        fileType: 'image',
        fileDescription: '',
        status: 'uploading',
      },
    ]);
  }, []);

  const clearData = useCallback(() => {
    setFilesToUpload([]);
    setUploadFilesToServer(false);
    setError(undefined);
  }, [setFilesToUpload, setUploadFilesToServer]);

  const contextValue = useMemo(
    () => ({
      multipleFiles,
      cameraOnly,
      collectCaption,
      saveFile,
      closeModal,
      onCompletion,
      filesToUpload,
      setFilesToUpload,
      uploadFilesToServer,
      setUploadFilesToServer,
      clearData,
      handleTakePhoto,
      error,
      setError,
    }),
    [
      multipleFiles,
      cameraOnly,
      collectCaption,
      saveFile,
      closeModal,
      onCompletion,
      filesToUpload,
      setFilesToUpload,
      uploadFilesToServer,
      setUploadFilesToServer,
      clearData,
      handleTakePhoto,
      error,
      setError,
    ],
  );

  const startUploadingToServer = useCallback(() => {
    setUploadFilesToServer(true);
  }, [setUploadFilesToServer]);

  // If the files are uploaded on the frontend, then the file preview modal should open up.
  if (!uploadFilesToServer && filesToUpload.length) {
    return (
      <CameraMediaUploaderContext.Provider value={contextValue}>
        <FilePreviewContainer onCompletion={startUploadingToServer} />
      </CameraMediaUploaderContext.Provider>
    );
  }

  // If the files are all set to upload, then filesUploader is visible on the screen.
  if (uploadFilesToServer) {
    return (
      <CameraMediaUploaderContext.Provider value={contextValue}>
        <UploadingStatusComponent />
      </CameraMediaUploaderContext.Provider>
    );
  }

  if (cameraOnly) {
    return (
      <CameraMediaUploaderContext.Provider value={contextValue}>
        <CameraComponent />
      </CameraMediaUploaderContext.Provider>
    );
  }

  return (
    <CameraMediaUploaderContext.Provider value={contextValue}>
      <div className={styles.cameraSection}>
        <h3 className={styles.paddedProductiveHeading03}>{t('addAttachment', 'Add Attachment')}</h3>
        <Tabs className={styles.tabs}>
          <Tab label={t('uploadMedia', 'Upload media')}>
            <MediaUploaderComponent />
          </Tab>
          <Tab label={t('webcam', 'Webcam')}>
            <CameraComponent />
          </Tab>
        </Tabs>
      </div>
    </CameraMediaUploaderContext.Provider>
  );
};

export default CameraMediaUploaderModal;
