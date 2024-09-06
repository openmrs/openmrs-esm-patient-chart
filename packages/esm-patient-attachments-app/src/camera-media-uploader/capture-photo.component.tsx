import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@carbon/react';
import { Edit } from '@carbon/react/icons';
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
      title: t('addPhoto', 'Add Image'),
      cameraOnly: false,
    });
  }, [onCapturePhoto, t]);

  const showPlaceholderText = !dataUri && !initialState;

  return (
    <div className={styles.imageContainer}>
      {showPlaceholderText ? (
        <div className={styles.placeholderText}>{t('noImageToDisplay', 'No image to display')}</div>
      ) : (
        <div className={styles.preview}>
          <img src={dataUri || initialState} alt="Preview" className={styles.previewImage} />
        </div>
      )}
      <div className={styles.editImage}>
        <span className={styles.editText}>{t('edit', 'Edit')}</span>
        <IconButton
          className={styles.editButton}
          label={showPlaceholderText ? t('addPatientImage', 'Add image') : t('changeImage', 'Change Image')}
          kind="ghost"
          onClick={showCam}
          size="md"
        >
          <Edit style={{ fill: '#ffffff' }} />
        </IconButton>
      </div>
    </div>
  );
};

export default CapturePhoto;
