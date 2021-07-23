import React, { useCallback, useEffect, useState, useRef } from 'react';
import Button from 'carbon-components-react/lib/components/Button';
import ImagePreview from './image-preview.component';
import styles from './camera-upload.css';
import Camera from 'react-html5-camera-photo';
import { useTranslation } from 'react-i18next';
import { createAttachment } from './attachments.resource';
import { readFileAsString } from './utils';
import 'react-html5-camera-photo/build/css/index.css';

export interface CameraUploadProps {
  openCameraOnRender?: boolean;
  collectCaption?: boolean;
  shouldNotRenderButton?: boolean;
  patientUuid: string;
  selectedFile?: File;
  onTakePhoto?(dataUri: string): void;
  delegateSaveImage?(dataUri: string, caption: string): void;
  onNewAttachment?(att: any): void;
}

const CameraUpload: React.FC<CameraUploadProps> = ({
  openCameraOnRender,
  onNewAttachment,
  delegateSaveImage,
  onTakePhoto,
  patientUuid,
  shouldNotRenderButton,
  collectCaption = true,
}) => {
  const mediaStream = useRef<MediaStream | undefined>();
  const [cameraIsOpen, setCameraIsOpen] = useState(openCameraOnRender);
  const [dataUri, setDataUri] = useState('');
  const { t } = useTranslation();

  const openCamera = useCallback(() => setCameraIsOpen(true), []);

  const clearCamera = useCallback(() => setDataUri(''), []);

  const handleTakePhoto = useCallback(
    (dataUri: string) => {
      setDataUri(dataUri);
      onTakePhoto?.(dataUri);
    },
    [onTakePhoto],
  );

  const upload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    readFileAsString(e.target.files[0]).then(setDataUri);
  }, []);

  const setMediaStream = useCallback((ms: MediaStream) => {
    mediaStream.current = ms;
  }, []);

  useEffect(() => {
    return () => {
      mediaStream.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleSaveImage = useCallback(
    (dataUri: string, caption: string) => {
      const abortController = new AbortController();
      createAttachment(patientUuid, dataUri, caption, abortController).then((res) => onNewAttachment?.(res.data));
    },
    [patientUuid, onNewAttachment],
  );

  const save = delegateSaveImage ?? handleSaveImage;

  const willSaveImage = useCallback(
    (dataUri: string, caption: string) => {
      save(dataUri, caption);
      clearCamera();
    },
    [clearCamera, save],
  );

  useEffect(() => setCameraIsOpen(openCameraOnRender), [openCameraOnRender]);

  return (
    <div className={styles.cameraSection}>
      {!shouldNotRenderButton && !cameraIsOpen && <Button onClick={openCamera}>{t('camera', 'Camera')}</Button>}
      {cameraIsOpen && (
        <div className={styles.frameContent}>
          {dataUri ? (
            <ImagePreview
              content={dataUri}
              onCancelCapture={clearCamera}
              onSaveImage={willSaveImage}
              collectCaption={collectCaption}
            />
          ) : (
            <>
              <Camera onTakePhoto={handleTakePhoto} onCameraStart={setMediaStream} />
              <div>
                <label htmlFor="uploadPhoto" className={styles.choosePhoto}>
                  {t('selectPhoto', 'Select local photo instead')}
                </label>
                <input type="file" id="uploadPhoto" accept="image/*" className={styles.uploadFile} onChange={upload} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CameraUpload;
