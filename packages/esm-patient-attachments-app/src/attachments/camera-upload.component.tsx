import React, { useCallback, useEffect, useState, useRef } from 'react';
import FilePreview from './image-preview.component';
import styles from './camera-upload.scss';
import Camera from 'react-html5-camera-photo';
import { showToast } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { readFileAsString } from './utils';
import 'react-html5-camera-photo/build/css/index.css';
import { Button, Tab, TabContent, Tabs } from 'carbon-components-react';

export interface CameraUploadProps {
  collectCaption?: boolean;
  onTakePhoto?(dataUri: string): void;
  onSavePhoto?(dataUri: string, caption: string): void;
}

const CameraUpload: React.FC<CameraUploadProps> = ({ onSavePhoto, onTakePhoto, collectCaption = true }) => {
  const mediaStream = useRef<MediaStream | undefined>();
  const [tab, setTab] = useState<'webcam' | 'upload'>('webcam');
  const [error, setError] = useState<Error>(undefined);
  const [dataUri, setDataUri] = useState([]);
  const { t } = useTranslation();

  console.log(dataUri);

  const clearCamera = useCallback(() => setDataUri([]), []);

  const handleTakePhoto = useCallback(
    (dataUri: string) => {
      setDataUri([dataUri]);
      onTakePhoto?.(dataUri);
    },
    [onTakePhoto],
  );

  const upload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      Object.values(e.target.files)?.forEach((file) =>
        readFileAsString(file).then((file) => {
          setDataUri((uriData) => [...uriData, file]);
        }),
      );
    },
    [setDataUri],
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
  }, [error]);

  useEffect(() => {
    return () => {
      mediaStream.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const willSaveAttachment = useCallback(
    (dataUri: string, caption: string) => onSavePhoto?.(dataUri, caption),
    [onSavePhoto],
  );

  if (dataUri.length) {
    return (
      <FilePreview
        content={dataUri}
        onCancelCapture={clearCamera}
        onSaveFile={willSaveAttachment}
        collectCaption={collectCaption}
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
