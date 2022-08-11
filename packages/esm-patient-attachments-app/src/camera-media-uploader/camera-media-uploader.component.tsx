import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { UploadedFile } from '../attachments-types';
import { FetchResponse, showToast } from '@openmrs/esm-framework';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';
import { useTranslation } from 'react-i18next';
import CameraComponent from './camera.component';
import styles from './camera-media-uploader.scss';
import { Tabs, Tab } from 'carbon-components-react';
import MediaUploaderComponent from './media-uploader.component';
import FileReviewContainer from './file-review.component';
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

  const startUploadingToServer = useCallback(() => {
    setUploadFilesToServer(true);
  }, [setUploadFilesToServer]);

  const returnComponent = useMemo(() => {
    // If the files are all set to upload, then filesUploader is visible on the screen.
    if (uploadFilesToServer) {
      return <UploadingStatusComponent />;
    }

    if (filesToUpload.length) {
      return <FileReviewContainer onCompletion={startUploadingToServer} />;
    }

    if (cameraOnly) {
      return <CameraComponent />;
    }

    return (
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
    );
  }, [uploadFilesToServer, filesToUpload, cameraOnly, t]);

  return (
    <CameraMediaUploaderContext.Provider
      value={{
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
      }}
    >
      {returnComponent}
    </CameraMediaUploaderContext.Provider>
  );
};

export default CameraMediaUploaderModal;
