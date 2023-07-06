import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { Edit } from '@carbon/react/icons';
import { showModal, toOmrsIsoString, useLayoutType } from '@openmrs/esm-framework';
import styles from './capture-photo.scss';
import placeholder from '../assets/placeholder.svg';

export interface CapturePhotoProps {
  onCapturePhoto(dataUri: string, photoDateTime: string): void;
  initialState?: string;
}

const CapturePhoto: React.FC<CapturePhotoProps> = ({ initialState, onCapturePhoto }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
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

  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        {dataUri || initialState ? <img src={dataUri || initialState} alt="Preview" /> : <p>No image to display</p>}
      </div>
      <Button
        kind="secondary"
        onClick={showCam}
        className={styles.button}
        renderIcon={Edit}
        size={isTablet ? 'lg' : 'sm'}
      >
        {initialState ? t('changeImage', 'Change') : t('editImage', 'Edit')}
      </Button>
    </div>
  );
};

export default CapturePhoto;
