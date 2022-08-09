import React, { useCallback, useState } from 'react';
import placeholder from '../assets/placeholder.svg';
import { Button } from 'carbon-components-react';
import { showModal, toOmrsIsoString } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

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
      collectCaption: false,
      closeModal: () => {
        close();
      },
      cameraOnly: true,
    });
  }, [onCapturePhoto]);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: '64px' }}>
        <img src={dataUri || initialState || placeholder} alt="Preview" style={{ width: '100%' }} />
      </div>
      <Button kind="ghost" onClick={showCam} style={{ flex: 1 }}>
        {initialState ? t('changeImage', 'Change image') : t('addImage', 'Add image +')}
      </Button>
    </div>
  );
};

export default CapturePhoto;
