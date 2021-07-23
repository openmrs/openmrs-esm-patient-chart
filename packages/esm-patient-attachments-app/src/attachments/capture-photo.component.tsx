import React, { useCallback, useState } from 'react';
import Button from 'carbon-components-react/lib/components/Button';
import placeholder from '../assets/placeholder.svg';
import { showModal, toOmrsIsoString } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

export interface CapturePhotoProps {
  patientUuid?: string;
  onCapturePhoto(dataUri: string, photoDateTime: string): void;
  initialState?: string;
}

const CapturePhoto: React.FC<CapturePhotoProps> = ({ patientUuid, initialState, onCapturePhoto }) => {
  const { t } = useTranslation();
  const [dataUri, setDataUri] = useState(null);

  const showCam = useCallback(() => {
    const close = showModal('capture-photo-modal', {
      delegateSaveImage(dataUri: string) {
        setDataUri(dataUri);
        onCapturePhoto(dataUri, toOmrsIsoString(new Date()));
        close();
      },
      collectCaption: false,
      openCameraOnRender: true,
      shouldNotRenderButton: true,
      patientUuid,
    });
  }, [patientUuid, onCapturePhoto]);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: '64px' }}>
        <img src={dataUri || initialState || placeholder} alt="Photo Preview" style={{ width: '100%' }} />
      </div>
      <Button kind="ghost" onClick={showCam} style={{ flex: 1 }}>
        {t('change', 'Change')}
      </Button>
    </div>
  );
};

export default CapturePhoto;
