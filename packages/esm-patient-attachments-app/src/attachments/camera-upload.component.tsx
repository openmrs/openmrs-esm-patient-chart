import React, { useCallback, useEffect, useState, useRef, Dispatch, SetStateAction } from 'react';
import Camera from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import {
  Button,
  ButtonSet,
  FileUploaderDropContainer,
  FileUploaderItem,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { showToast, FetchResponse } from '@openmrs/esm-framework';
import { readFileAsString } from './utils';
import { UploadedFile } from './attachments-types';
import FilePreview from './file-preview.component';
import styles from './camera-upload.scss';

export interface CameraUploadProps {
  collectCaption?: boolean;
  saveFile: (file: UploadedFile) => Promise<FetchResponse<any>>;
  closeModal: () => void;
  onCompletion?: () => void;
}

const CameraUpload: React.FC<CameraUploadProps> = ({ saveFile, closeModal, onCompletion }) => {
  const [error, setError] = useState<Error>(undefined);
  const [uploadedFiles, setUploadedFiles] = useState<Array<UploadedFile>>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const { t } = useTranslation();

  const clearCamera = useCallback(() => {
    setUploadedFiles([]);
    setUploadingFiles(false);
    setError(undefined);
  }, [setUploadedFiles, setUploadingFiles]);

  const handleTakePhoto = useCallback((file: string) => {
    setUploadedFiles([
      {
        fileContent: file,
        fileName: 'Image taken from camera',
        fileType: 'image',
        fileDescription: '',
        status: 'uploading',
      },
    ]);
  }, []);

  const upload = useCallback(
    (files: Array<File>) => {
      files.forEach((file) =>
        readFileAsString(file).then((fileContent) => {
          setUploadedFiles((uriData) => [
            ...uriData,
            {
              fileContent,
              fileName: file.name,
              fileType: file.type === 'application/pdf' ? 'pdf' : 'image',
              fileDescription: '',
              status: 'uploading',
            },
          ]);
        }),
      );
    },
    [setUploadedFiles],
  );

  useEffect(() => {
    if (error) {
      showToast({
        description: error.message,
        kind: 'error',
        title: t('cameraError', 'Camera Error'),
      });
    }
  }, [error, t]);

  const willSaveAttachment = useCallback((uploadedFiles: Array<UploadedFile>) => {
    setUploadedFiles(uploadedFiles);
    setUploadingFiles(true);
  }, []);

  if (uploadingFiles) {
    return (
      <FileUploadingComponent
        uploadedFiles={uploadedFiles}
        saveFile={saveFile}
        setUploadedFiles={setUploadedFiles}
        clearCamera={clearCamera}
        closeModal={closeModal}
        onCompletion={onCompletion}
      />
    );
  }

  if (uploadedFiles.length) {
    return (
      <FilePreview
        onCancelCapture={() => {
          clearCamera();
        }}
        onSaveFile={(data: Array<UploadedFile>) => {
          willSaveAttachment(data);
        }}
        uploadedFiles={uploadedFiles}
      />
    );
  }

  return (
    <div className={styles.cameraSection}>
      <h3 className={styles.paddedProductiveHeading03}>{t('addAttachment', 'Add Attachment')}</h3>
      <Tabs className={styles.tabs}>
        <TabList aria-label="Attachment upload options">
          <Tab>{t('uploadMedia', 'Upload media')}</Tab>
          <Tab>{t('webcam', 'Webcam')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className="cds--file__container">
              <p className="cds--label-description"></p>
              <div className={styles.uploadFile}>
                <FileUploaderDropContainer
                  accept={['image/*', 'application/pdf']}
                  labelText={t('fileUploadInstructions', 'Drag and drop files here or click to upload')}
                  tabIndex={0}
                  multiple
                  onAddFiles={(evt, { addedFiles }) => {
                    upload(addedFiles);
                  }}
                />
              </div>
            </div>
          </TabPanel>
          <TabPanel>
            <CameraComponent handleTakePhoto={handleTakePhoto} setError={setError} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

const CameraComponent = ({ handleTakePhoto, setError }) => {
  const mediaStream = useRef<MediaStream | undefined>();
  useEffect(() => {
    return () => {
      mediaStream.current?.getTracks().forEach((t) => t.stop());
    };
  }, [mediaStream]);
  const setMediaStream = useCallback((ms: MediaStream) => {
    mediaStream.current = ms;
  }, []);
  return <Camera onTakePhoto={handleTakePhoto} onCameraStart={setMediaStream} onCameraError={setError} />;
};

export default CameraUpload;

interface FileUploadingComponentProps {
  uploadedFiles: Array<UploadedFile>;
  saveFile: (file: UploadedFile) => Promise<FetchResponse<any>>;
  setUploadedFiles: Dispatch<SetStateAction<Array<UploadedFile>>>;
  closeModal: () => void;
  clearCamera: () => void;
  onCompletion?: () => void;
}

export const FileUploadingComponent: React.FC<FileUploadingComponentProps> = ({
  uploadedFiles,
  saveFile,
  setUploadedFiles,
  closeModal,
  clearCamera,
  onCompletion,
}) => {
  const { t } = useTranslation();
  const [uploadingCompleted, setUploadingComplete] = useState(false);

  useEffect(() => {
    Promise.all(
      uploadedFiles.map((file, indx) =>
        saveFile(file).then(() => {
          showToast({
            title: t('uploadComplete', 'Upload complete'),
            description: `${file.fileName} ${t('uploadedSuccessfully', 'uploaded successfully')}`,
            kind: 'success',
          });
          setUploadedFiles((uploadedFiles) =>
            uploadedFiles.map((file, ind) =>
              ind === indx
                ? {
                    ...file,
                    status: 'complete',
                  }
                : file,
            ),
          );
        }),
      ),
    ).then(() => {
      setUploadingComplete(true);
      onCompletion?.();
    });
  }, [onCompletion, saveFile, setUploadedFiles, t, uploadedFiles]);
  return (
    <div className={styles.cameraSection}>
      <h3 className={styles.paddedProductiveHeading03}>{t('addAttachment', 'Add Attachment')}</h3>
      <div className={styles.uploadingFilesSection}>
        {uploadedFiles.map((file) => (
          <FileUploaderItem name={file.fileName} status={file.status} />
        ))}
      </div>
      {uploadingCompleted && (
        <ButtonSet className={styles.buttonSet}>
          <Button size="lg" kind="secondary" onClick={clearCamera}>
            {t('addMoreAttachments', 'Add more attachments')}
          </Button>
          <Button size="lg" kind="primary" onClick={closeModal}>
            {t('closeModal', 'Close')}
          </Button>
        </ButtonSet>
      )}
    </div>
  );
};
