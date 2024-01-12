import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { showModal, toOmrsIsoString } from '@openmrs/esm-framework';
import placeholder from '../assets/placeholder.svg';

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

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <button
        type="button"
        onClick={showCam}
        style={{ border: 'none', maxWidth: '64px', padding: 0, margin: 0, background: 'none', cursor: 'pointer' }}
      >
        <img src={dataUri || initialState || placeholder} alt="Preview" style={{ width: '100%' }} />
      </button>
      <Button kind="ghost" onClick={showCam} style={{ flex: 1 }}>
        {initialState ? t('changeImage', 'Change image') : t('addImage', 'Add image +')}
      </Button>
    </div>
  );
};

export default CapturePhoto;
