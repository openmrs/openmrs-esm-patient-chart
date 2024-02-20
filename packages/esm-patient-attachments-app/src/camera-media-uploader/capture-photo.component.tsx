import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { Camera } from '@carbon/react/icons';
import { showModal, toOmrsIsoString, type UploadedFile } from '@openmrs/esm-framework';
import styles from './capture-photo.scss';

export interface CapturePhotoProps {
  onCapturePhoto(dataUri: string, photoDateTime: string): void;
  initialState?: string;
}

const CapturePhoto: React.FC<CapturePhotoProps> = ({ initialState, onCapturePhoto }) => {
  const { t } = useTranslation();
  const [dataUri, setDataUri] = useState(null);

  const showCam = useCallback(() => {
    const close = showModal('capture-photo-modal', {
      saveFile(file: UploadedFile) {
        return Promise.resolve().then(() => {
          setDataUri(file.base64Content);
          onCapturePhoto(file.base64Content, toOmrsIsoString(new Date()));
          close();
        });
      },
      collectDescription: false,
      closeModal: () => {
        close();
      },
      cameraOnly: false,
    });
  }, [onCapturePhoto]);

  const showPlaceholderIcon = !dataUri && !initialState;

  return (
    <div className={styles.container}>
      <button type="button" onClick={showCam} className={styles.buttonCssReset}>
        {showPlaceholderIcon ? (
          <div className={styles.placeholderIconContainer}>
            <Camera size="20" />
          </div>
        ) : (
          <img src={dataUri || initialState} alt="Preview" className={styles.preview} />
        )}
      </button>
      <Button kind="ghost" onClick={showCam} className={styles.actionButton}>
        {initialState ? t('changeImage', 'Change image') : t('addImage', 'Add image +')}
      </Button>
    </div>
  );
};

export default CapturePhoto;
