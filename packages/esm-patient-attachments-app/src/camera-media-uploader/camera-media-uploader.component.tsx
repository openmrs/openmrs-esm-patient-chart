import React, { useState, useCallback, useMemo, useEffect, useRef, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, Tab, TabList, TabPanels, TabPanel, ModalHeader, ModalBody, InlineNotification } from '@carbon/react';
import { type FetchResponse, type UploadedFile } from '@openmrs/esm-framework';
import CameraComponent from './camera.component';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';
import FileReviewContainer from './file-review.component';
import MediaUploaderComponent from './media-uploader.component';
import UploadStatusComponent from './upload-status.component';
import styles from './camera-media-uploader.scss';

interface CameraMediaUploaderModalProps {
  allowedExtensions: Array<string> | null;
  cameraOnly?: boolean;
  closeModal: () => void;
  collectDescription?: boolean;
  multipleFiles?: boolean;
  onCompletion?: () => void;
  saveFile: (file: UploadedFile) => Promise<FetchResponse<any>>;
  title?: string;
}

interface CameraMediaUploadTabsProps {
  title?: string;
}

const CameraMediaUploaderModal: React.FC<CameraMediaUploaderModalProps> = ({
  allowedExtensions,
  cameraOnly,
  closeModal,
  collectDescription,
  multipleFiles,
  onCompletion,
  saveFile,
  title,
}) => {
  const [error, setError] = useState<Error>(null);
  const [filesToUpload, setFilesToUpload] = useState<Array<UploadedFile>>([]);
  const [uploadFilesToServer, setUploadFilesToServer] = useState(false);

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
      return <UploadStatusComponent title={title} />;
    }

    if (filesToUpload.length) {
      return <FileReviewContainer title={title} onCompletion={startUploadingToServer} />;
    }

    return <CameraMediaUploadTabs title={title} />;
  }, [uploadFilesToServer, filesToUpload, startUploadingToServer, title]);

  return (
    <CameraMediaUploaderContext.Provider
      value={{
        allowedExtensions,
        cameraOnly,
        clearData,
        closeModal,
        collectDescription,
        error,
        filesToUpload,
        handleTakePhoto,
        multipleFiles,
        onCompletion,
        saveFile,
        setError,
        setFilesToUpload,
        setUploadFilesToServer,
        uploadFilesToServer,
      }}
    >
      {returnComponent}
    </CameraMediaUploaderContext.Provider>
  );
};

const CameraMediaUploadTabs: React.FC<CameraMediaUploadTabsProps> = ({ title }) => {
  const { t } = useTranslation();
  const [view, setView] = useState('upload');

  const { cameraOnly, closeModal, error } = useContext(CameraMediaUploaderContext);
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
      <ModalHeader closeModal={closeModal} title={title ? title : t('addAttachment_title', 'Add Attachment')} />
      <ModalBody className={styles.modalBody}>
        <Tabs className={styles.tabs} defaultSelectedIndex={1}>
          <TabList aria-label="Attachments-upload-section" className={styles.tabList}>
            <Tab onClick={() => setView('camera')}>{t('webcam', 'Webcam')}</Tab>
            <Tab onClick={() => setView('upload')}>{t('uploadFiles', 'Upload files')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {error ? (
                <InlineNotification
                  subtitle={t(
                    'cameraAccessErrorMessage',
                    'Please enable camera access in your browser settings and try again.',
                  )}
                  title={t('cameraError', 'Camera error')}
                />
              ) : null}
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
