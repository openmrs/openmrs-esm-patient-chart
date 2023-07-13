import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { Edit } from '@carbon/react/icons';
import { ExtensionSlot, showModal, toOmrsIsoString, useLayoutType, usePatient } from '@openmrs/esm-framework';
import styles from './capture-photo.scss';

export interface CapturePhotoProps {
  onCapturePhoto(dataUri: string, photoDateTime: string): void;
  initialState?: string;
}

const CapturePhoto: React.FC<CapturePhotoProps> = ({ initialState, onCapturePhoto }) => {
  const { t } = useTranslation();
  const { patient, patientUuid } = usePatient();
  const [dataUri, setDataUri] = useState(null);
  const isTablet = useLayoutType() === 'tablet';
  const inEditMode = !!patientUuid;

  const patientName = `${patient?.name?.[0]?.given?.join(' ')} ${patient?.name?.[0].family}`;
  const patientPhotoSlotState = useMemo(
    () => ({ patientUuid, patientName, editing: inEditMode }),
    [patientUuid, patientName, inEditMode],
  );

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
  const isImageAvailable = dataUri ?? initialState;
  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        {isImageAvailable ? (
          <img src={dataUri || initialState} alt="Preview" />
        ) : inEditMode ? (
          <ExtensionSlot name="patient-photo-slot" state={patientPhotoSlotState} />
        ) : (
          <p>No image to display</p>
        )}
      </div>
      <Button
        kind="secondary"
        onClick={showCam}
        className={styles.button}
        renderIcon={Edit}
        size={isTablet ? 'lg' : 'sm'}
      >
        {isImageAvailable ? t('changeImage', 'Change') : t('editImage', 'Edit')}
      </Button>
    </div>
  );
};

export default CapturePhoto;
