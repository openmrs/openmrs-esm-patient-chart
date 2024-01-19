import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { showModal, toOmrsIsoString } from '@openmrs/esm-framework';
import placeholder from '../assets/placeholder.svg';
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
        <div className={showPlaceholderIcon ? styles.placeholderIconContainer : null}>
          <img
            src={dataUri || initialState || placeholder}
            alt="Preview"
            style={showPlaceholderIcon ? { width: '30%' } : { width: '100%' }}
          />
        </div>
      </button>
      <Button kind="ghost" onClick={showCam} style={{ flex: 1 }}>
        {initialState ? t('changeImage', 'Change image') : t('addImage', 'Add image +')}
      </Button>
    </div>
  );
};

export default CapturePhoto;
