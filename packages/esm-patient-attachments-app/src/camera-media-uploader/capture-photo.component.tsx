import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { showModal, toOmrsIsoString } from '@openmrs/esm-framework';
import styles from './capture-photo.scss';
import { Camera } from '@carbon/react/icons';

export interface CapturePhotoProps {
  onCapturePhoto(dataUri: string, photoDateTime: string): void;
  initialState?: string;
}

const CapturePhoto: React.FC<CapturePhotoProps> = ({ initialState, onCapturePhoto }) => {
  const { t } = useTranslation();
  const [dataUri, setDataUri] = useState(null);

  const showCam = useCallback(() => {
    const close = showModal('capture-photo-modal', {
      saveFile(dataUri: string) {
        setDataUri(dataUri);
        onCapturePhoto(dataUri, toOmrsIsoString(new Date()));
        close();
      },
      collectDescription: false,
      closeModal: () => {
        close();
      },
      cameraOnly: true,
    });
  }, [onCapturePhoto]);

  const showPlaceholderIcon = !dataUri && !initialState;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <button type="button" onClick={showCam} className={styles.buttonCssReset}>
        {showPlaceholderIcon ? (
          <div className={styles.placeholderIconContainer}>
            <Camera size="20"></Camera>
          </div>
        ) : (
          <img src={dataUri || initialState} alt="Preview" style={{ width: '100%' }} />
        )}
      </button>
      <Button kind="ghost" onClick={showCam} style={{ flex: 1 }}>
        {initialState ? t('changeImage', 'Change image') : t('addImage', 'Add image +')}
      </Button>
    </div>
  );
};

export default CapturePhoto;
