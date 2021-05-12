import React, { useCallback, useEffect, useState } from 'react';
import CameraFrame from './camera-frame.component';
import ImagePreview from './image-preview.component';
import styles from './camera-upload.css';
import Camera from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import './styles.css';
import { createAttachment } from './attachments.resource';
import { useTranslation } from 'react-i18next';
import { Attachment } from './attachments-overview.component';
export interface CameraUploadProps {
  openCameraOnRender?: boolean;
  collectCaption?: boolean;
  shouldNotRenderButton?: boolean;
  patientUuid: string;
  closeCamera?(): void;
  onTakePhoto?(dataUri: string): void;
  delegateSaveImage?(dataUri: string, selectedFile: File, caption: string): void;
  selectedFile?: File;
  onNewAttachment?(att: Attachment): void;
}

const CameraUpload: React.FC<CameraUploadProps> = ({
  openCameraOnRender,
  onNewAttachment,
  delegateSaveImage,
  closeCamera,
  onTakePhoto,
  patientUuid,
  shouldNotRenderButton,
  collectCaption = true,
}) => {
  const [cameraIsOpen, setCameraIsOpen] = useState(openCameraOnRender);
  const [dataUri, setDataUri] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const { t } = useTranslation();

  const openCamera = useCallback(() => {
    setCameraIsOpen(true);
  }, []);

  const clearCamera = useCallback(() => {
    setDataUri('');
    setSelectedFile(null);
  }, []);

  const handleCloseCamera = useCallback(() => {
    setCameraIsOpen(false);
    closeCamera?.();
    clearCamera();
  }, [closeCamera, clearCamera]);

  const handleTakePhoto = useCallback(
    (dataUri: string) => {
      setDataUri(dataUri);
      onTakePhoto?.(dataUri);
    },
    [onTakePhoto],
  );

  const handleSaveImage = useCallback(
    (dataUri: string, caption: string, selectedFile: File) => {
      const abortController = new AbortController();
      createAttachment(patientUuid, selectedFile, caption, abortController, dataUri).then((res) => {
        onNewAttachment?.({
          id: `${res.data.uuid}`,
          src: `${window.openmrsBase}/ws/rest/v1/attachment/${res.data.uuid}/bytes`,
          thumbnail: `${window.openmrsBase}/ws/rest/v1/attachment/${res.data.uuid}/bytes`,
          thumbnailWidth: 320,
          thumbnailHeight: 212,
          caption: res.data.comment,
          isSelected: false,
        });
      });
    },
    [patientUuid, onNewAttachment],
  );

  const willSaveImage = useCallback(
    (dataUri: string, selectedFile: File, caption: string) => {
      if (delegateSaveImage) {
        delegateSaveImage(dataUri, selectedFile, caption);
      } else {
        // fallback to default implementation
        handleSaveImage(dataUri, caption, selectedFile);
      }
      clearCamera();
    },
    [clearCamera, delegateSaveImage, handleSaveImage],
  );

  useEffect(() => {
    setCameraIsOpen(openCameraOnRender);
  }, [openCameraOnRender]);

  return (
    <div className={styles.cameraSection}>
      {!shouldNotRenderButton && (
        <button className="cameraButton" onClick={openCamera}>
          {t('camera', 'Camera')}
        </button>
      )}
      {cameraIsOpen && (
        <CameraFrame
          onCloseCamera={handleCloseCamera}
          setSelectedFile={setSelectedFile}
          inPreview={dataUri || selectedFile}>
          {dataUri || selectedFile ? (
            <ImagePreview
              dataUri={dataUri}
              selectedFile={selectedFile}
              onCancelCapture={clearCamera}
              onSaveImage={willSaveImage}
              collectCaption={collectCaption}
            />
          ) : (
            <div id="camera-inner-wrapper">
              <Camera onTakePhoto={handleTakePhoto} />
            </div>
          )}
        </CameraFrame>
      )}
    </div>
  );
};

export default CameraUpload;
