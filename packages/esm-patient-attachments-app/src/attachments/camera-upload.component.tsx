import React, { useCallback, useEffect, useState, useRef } from 'react';
import FilePreview from './file-preview.component';
import styles from './camera-upload.scss';
import Camera from 'react-html5-camera-photo';
import { showToast } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { readFileAsString } from './utils';
import 'react-html5-camera-photo/build/css/index.css';
import { Tab, Tabs, FileUploaderDropContainer } from 'carbon-components-react';
import { UploadedFile } from './attachments-types';

export interface CameraUploadProps {
  collectCaption?: boolean;
  onTakePhoto?(file: string): void;
  onSavePhoto?(file: string, caption: string): void;
}

const CameraUpload: React.FC<CameraUploadProps> = ({ onSavePhoto, onTakePhoto }) => {
  const mediaStream = useRef<MediaStream | undefined>();
  const [error, setError] = useState<Error>(undefined);
  const [uploadedFiles, setUploadedFiles] = useState<Array<UploadedFile>>([]);
  const { t } = useTranslation();
  const [cameraTabOpen, setCameraTabOpen] = useState(true);

  const clearCamera = useCallback(() => setUploadedFiles([]), []);

  const handleTakePhoto = useCallback(
    (file: string) => {
      setUploadedFiles([
        {
          fileContent: file,
          fileName: 'Image taken from camera',
          fileType: 'image',
          fileDescription: '',
        },
      ]);
      onTakePhoto?.(file);
    },
    [onTakePhoto],
  );

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
            },
          ]);
        }),
      );
    },
    [setUploadedFiles],
  );

  const setMediaStream = useCallback((ms: MediaStream) => {
    mediaStream.current = ms;
  }, []);

  useEffect(() => {
    if (error) {
      showToast({
        description: error.message,
        kind: 'error',
        title: t('cameraError', 'Camera Error'),
      });
    }
  }, [error, t]);

  useEffect(() => {
    if (!cameraTabOpen) {
      return () => {
        mediaStream.current?.getTracks().forEach((t) => t.stop());
      };
    } else {
    }
  }, [cameraTabOpen]);

  const willSaveAttachment = useCallback(
    (data: Array<UploadedFile>) => {
      // onSavePhoto?.(file, caption),
    },
    [onSavePhoto],
  );

  if (uploadedFiles.length) {
    return (
      <FilePreview
        onCancelCapture={() => {
          clearCamera();
        }}
        onSaveFile={(data: Array<UploadedFile>) => {
          willSaveAttachment(data);
          clearCamera();
        }}
        uploadedFiles={uploadedFiles}
      />
    );
  }

  return (
    <div className={styles.cameraSection}>
      <h3 className={styles.paddedProductiveHeading03}>{t('addAttachment', 'Add Attachment')}</h3>
      <Tabs className={styles.tabs}>
        <Tab label={t('webcam', 'Webcam')} onClick={() => setCameraTabOpen(true)}>
          <Camera onTakePhoto={handleTakePhoto} onCameraError={setError} />
        </Tab>
        <Tab label={t('uploadMedia', 'Upload media')} onClick={() => setCameraTabOpen(false)}>
          <div className="cds--file__container">
            <p className="cds--label-description">
              {t('fileUploadTypes', 'Only images and pdf files. 500kb max file size')}
            </p>
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
        </Tab>
      </Tabs>
    </div>
  );
};

export default CameraUpload;
