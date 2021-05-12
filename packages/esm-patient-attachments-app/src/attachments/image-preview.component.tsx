import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserHasAccess } from '@openmrs/esm-framework';
import Button from 'carbon-components-react/es/components/Button';
import ButtonSet from 'carbon-components-react/es/components/ButtonSet';
import styles from './image-preview.css';
import { TextInput } from 'carbon-components-react';

export default function ImagePreview(props: ImagePreviewProps) {
  const [caption, setCaption] = useState('');
  const { t } = useTranslation();

  function saveImage(e: React.SyntheticEvent) {
    e.preventDefault();
    props.onSaveImage(props.dataUri, props.selectedFile, caption);
  }

  function cancelCapture(e: React.SyntheticEvent) {
    e.preventDefault();
    props.onCancelCapture();
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function updateCaption(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    e.stopPropagation();
    setCaption(e.target.value);
  }

  return (
    <form className={styles.overview} onSubmit={handleSubmit}>
      <img
        src={props.dataUri ? props.dataUri : URL.createObjectURL(props.selectedFile)}
        alt={t('webcamPreview', 'Webcam preview')}
      />
      {props.collectCaption && (
        <div style={{ marginBottom: '.3rem' }}>
          <TextInput
            id="caption"
            labelText={null}
            placeholder={t('attachmentCaptionInstruction', 'Enter caption')}
            onChange={updateCaption}
          />
        </div>
      )}
      <UserHasAccess privilege="Create Attachment">
        <ButtonSet style={{ width: '50%' }} className={styles.buttonSetOverrides}>
          <Button size="small" onClick={saveImage}>
            {t('save', 'Save')}{' '}
          </Button>
          <Button kind="danger" size="small" onClick={cancelCapture}>
            {t('cancel', 'Cancel')}{' '}
          </Button>
        </ButtonSet>
      </UserHasAccess>
    </form>
  );
}

type ImagePreviewProps = {
  dataUri: string;
  collectCaption: boolean;
  selectedFile?: File;
  onSaveImage?(dataUri: string, selectedFile: File, caption: string): void;
  onCancelCapture?(): void;
};
