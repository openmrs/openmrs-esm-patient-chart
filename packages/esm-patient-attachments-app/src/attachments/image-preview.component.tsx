import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserHasAccess } from '@openmrs/esm-framework';
import Button from 'carbon-components-react/es/components/Button';
import ButtonSet from 'carbon-components-react/es/components/ButtonSet';
import TextInput from 'carbon-components-react/es/components/TextInput';
import styles from './image-preview.css';

interface ImagePreviewProps {
  content: string;
  collectCaption: boolean;
  onSaveImage?(dataUri: string, caption: string): void;
  onCancelCapture?(): void;
}

export default function ImagePreview(props: ImagePreviewProps) {
  const [caption, setCaption] = useState('');
  const { t } = useTranslation();

  const saveImage = (e: React.SyntheticEvent) => {
    e.preventDefault();
    props.onSaveImage?.(props.content, caption);
  };

  const cancelCapture = React.useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      props.onCancelCapture?.();
    },
    [props.onCancelCapture],
  );

  const updateCaption = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setCaption(e.target.value);
  }, []);

  return (
    <form className={styles.overview} onSubmit={saveImage}>
      <img src={props.content} alt={t('webcamPreview', 'Webcam preview')} />
      {props.collectCaption && (
        <div className={styles.captionFrame}>
          <TextInput
            id="caption"
            autoFocus
            labelText={null}
            placeholder={t('attachmentCaptionInstruction', 'Enter caption')}
            onChange={updateCaption}
          />
        </div>
      )}
      <UserHasAccess privilege="Create Attachment">
        <ButtonSet className={styles.buttonSetOverrides}>
          <Button size="small" onClick={saveImage}>
            {t('save', 'Save')}
          </Button>
          <Button kind="danger" size="small" onClick={cancelCapture}>
            {t('cancel', 'Cancel')}
          </Button>
        </ButtonSet>
      </UserHasAccess>
    </form>
  );
}
