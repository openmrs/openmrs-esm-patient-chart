import React, { useCallback, useEffect, useState, useRef } from 'react';
import FilePreview, { FilePreviewContainerProps } from './file-preview.component';
import styles from './camera-upload.scss';
import Camera from 'react-html5-camera-photo';
import { showToast, showModal } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { readFileAsString } from './utils';
import 'react-html5-camera-photo/build/css/index.css';
import { Button, Tab, TabContent, Tabs } from 'carbon-components-react';
import { UploadedFile } from './attachments-types';

export interface CameraUploadProps {
  collectCaption?: boolean;
  onTakePhoto?(file: string): void;
  onSavePhoto?(file: string, caption: string): void;
}

const CameraUpload: React.FC<CameraUploadProps> = ({ onSavePhoto, onTakePhoto }) => {
  const mediaStream = useRef<MediaStream | undefined>();
  const [tab, setTab] = useState<'webcam' | 'upload'>('webcam');
  const [error, setError] = useState<Error>(undefined);
  const [uploadedFiles, setUploadedFiles] = useState<Array<UploadedFile>>([]);
  const { t } = useTranslation();

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
    (e: React.ChangeEvent<HTMLInputElement>) => {
      Object.values(e.target.files)?.forEach((file) =>
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
    return () => {
      mediaStream.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

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
        <Tab label={t('webcam', 'Webcam')} onClick={() => setTab('webcam')} />
        <Tab label={t('uploadMedia', 'Upload media')} onClick={() => setTab('upload')} />
      </Tabs>
      <div className={styles.tabContent}>
        {tab === 'webcam' ? (
          !error && <Camera onTakePhoto={handleTakePhoto} onCameraStart={setMediaStream} onCameraError={setError} />
        ) : (
          <div>
            <label htmlFor="uploadFile" className={styles.choosePhotoOrPdf}>
              {t('selectFile', 'Select local File instead')}
            </label>
            <input
              type="file"
              id="uploadFile"
              accept="image/*, application/pdf"
              className={styles.uploadFile}
              onChange={upload}
              multiple
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraUpload;
