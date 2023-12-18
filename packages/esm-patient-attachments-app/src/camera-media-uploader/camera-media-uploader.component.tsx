import React, { useState, useCallback, useMemo, useEffect, useRef, useContext } from 'react';
import { type UploadedFile } from '../attachments-types';
import { type FetchResponse, showSnackbar } from '@openmrs/esm-framework';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';
import { useTranslation } from 'react-i18next';
import CameraComponent from './camera.component';
import styles from './camera-media-uploader.scss';
import { Tabs, Tab, TabList, TabPanels, TabPanel, ModalHeader, ModalBody } from '@carbon/react';
import MediaUploaderComponent from './media-uploader.component';
import FileReviewContainer from './file-review.component';
import UploadingStatusComponent from './uploading-status.component';

interface CameraMediaUploaderModalProps {
  multipleFiles?: boolean;
  cameraOnly?: boolean;
  collectDescription?: boolean;
  saveFile: (file: UploadedFile) => Promise<FetchResponse<any>>;
  closeModal: () => void;
  onCompletion?: () => void;
  allowedExtensions: Array<string> | null;
}

const CameraMediaUploaderModal: React.FC<CameraMediaUploaderModalProps> = ({
  cameraOnly,
  multipleFiles,
  collectDescription,
  saveFile,
  closeModal,
  onCompletion,
  allowedExtensions,
}) => {
  const [error, setError] = useState<Error>(undefined);
  const [filesToUpload, setFilesToUpload] = useState<Array<UploadedFile>>([]);
  const [uploadFilesToServer, setUploadFilesToServer] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (error) {
      showSnackbar({
        subtitle: error.message,
        kind: 'error',
        title: t('cameraError', 'Camera Error'),
      });
    }
  }, [error, t]);

  const handleTakePhoto = useCallback((file: string) => {
    setFilesToUpload([
      {
        base64Content: file,
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

    return <CameraMediaUploadTabs />;
  }, [uploadFilesToServer, filesToUpload, startUploadingToServer]);

  return (
    <CameraMediaUploaderContext.Provider
      value={{
        multipleFiles,
        cameraOnly,
        collectDescription,
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
        allowedExtensions,
      }}
    >
      {returnComponent}
    </CameraMediaUploaderContext.Provider>
  );
};

const CameraMediaUploadTabs = () => {
  const { t } = useTranslation();
  const [view, setView] = useState('upload');
  const { cameraOnly, closeModal } = useContext(CameraMediaUploaderContext);
  const mediaStream = useRef<MediaStream | undefined>();

  const stopCameraStream = useCallback(() => {
    mediaStream.current?.getTracks().forEach((t) => t.stop());
  }, [mediaStream]);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  if (cameraOnly) {
    return <CameraComponent mediaStream={mediaStream} stopCameraStream={stopCameraStream} />;
  }

  return (
    <div className={styles.cameraSection}>
      <ModalHeader closeModal={closeModal} title={t('addAttachment_title', 'Add Attachment')} />
      <ModalBody className={styles.modalBody}>
        <Tabs className={styles.tabs} defaultSelectedIndex={1}>
          <TabList aria-label="Attachments-upload-section" className={styles.tabList}>
            <Tab onClick={() => setView('camera')}>{t('webcam', 'Webcam')}</Tab>
            <Tab onClick={() => setView('upload')}>{t('uploadFiles', 'Upload files')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {view === 'camera' && <CameraComponent mediaStream={mediaStream} stopCameraStream={stopCameraStream} />}
            </TabPanel>
            <TabPanel>
              <MediaUploaderComponent />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </ModalBody>
    </div>
  );
};

export default CameraMediaUploaderModal;
