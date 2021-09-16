import React, { SyntheticEvent, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserHasAccess } from '@openmrs/esm-framework';
import { Button, ButtonSet, TextInput } from 'carbon-components-react';
import styles from './image-preview.scss';

interface ImagePreviewProps {
  content: string;
  collectCaption: boolean;
  onSaveImage?(dataUri: string, caption: string): void;
  onCancelCapture?(): void;
}

export default function ImagePreview(props: ImagePreviewProps) {
  const [saving, setSaving] = useState(false);
  const [caption, setCaption] = useState('');
  const { t } = useTranslation();

  const saveImage = useCallback(
    (e: SyntheticEvent) => {
      if (!saving) {
        e.preventDefault();
        props.onSaveImage?.(props.content, caption);
        setSaving(true);
      }
    },
    [props.onSaveImage, saving],
  );

  const cancelCapture = useCallback(
    (e: SyntheticEvent) => {
      if (!saving) {
        e.preventDefault();
        props.onCancelCapture?.();
      }
    },
    [props.onCancelCapture, saving],
  );

  const updateCaption = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
            readOnly={saving}
            placeholder={t('attachmentCaptionInstruction', 'Enter caption')}
            onChange={updateCaption}
          />
        </div>
      )}
      <UserHasAccess privilege="Create Attachment">
        <ButtonSet className={styles.buttonSetOverrides}>
          <Button size="small" onClick={saveImage} disabled={saving}>
            {t('save', 'Save')}
          </Button>
          <Button kind="danger" size="small" onClick={cancelCapture} disabled={saving}>
            {t('cancel', 'Cancel')}
          </Button>
        </ButtonSet>
      </UserHasAccess>
    </form>
  );
}
