import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { Button } from '@carbon/react';
import { Edit } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { showModal, toOmrsIsoString, useLayoutType, type UploadedFile } from '@openmrs/esm-framework';
import styles from './capture-photo.scss';

export interface CapturePhotoProps {
  onCapturePhoto(dataUri: string, photoDateTime: string): void;
  initialState?: string;
}

const CapturePhoto: React.FC<CapturePhotoProps> = ({ initialState, onCapturePhoto }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';
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
      cameraOnly: false,
      collectDescription: false,
      closeModal: () => {
        close();
      },
      title: t('addAnImage', 'Add image'),
    });
  }, [onCapturePhoto, t]);

  const showEmptyState = !dataUri && !initialState;

  return (
    <>
      <div className={styles.imageContainer}>
        {showEmptyState ? (
          <span className={styles.emptyState}>{t('noImageToDisplay', 'No image to display')}</span>
        ) : (
          <img
            alt={t('imagePreview', 'Image preview')}
            className={classNames({
              [styles.imagePreview]: !showEmptyState,
              [styles.altImagePreview]: !dataUri || !initialState,
            })}
            src={dataUri || initialState}
          />
        )}
      </div>
      <div className={styles.editButtonContainer}>
        <Button
          className={styles.editButton}
          kind="ghost"
          onClick={showCam}
          renderIcon={(props) => <Edit {...props} />}
          size={responsiveSize}
        >
          <span>{t('edit', 'Edit')}</span>
        </Button>
      </div>
    </>
  );
};

export default CapturePhoto;
