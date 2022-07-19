import React, { SyntheticEvent, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserHasAccess } from '@openmrs/esm-framework';
import { Button, ButtonSet, TextArea, TextInput } from 'carbon-components-react';
import styles from './image-preview.scss';

interface FilePreviewContainerProps {
  content: Array<string>;
  collectCaption: boolean;
  collectDescription?: boolean;
  onSaveFile?(dataUri: string, caption: string, description?: string): void;
  onCancelCapture?(): void;
}

const FilePreviewContainer: React.FC<FilePreviewContainerProps> = ({
  content,
  collectCaption,
  collectDescription,
  onSaveFile,
  onCancelCapture,
}) => {
  const { t } = useTranslation();
  const [currentFile, setCurrentFile] = useState(1);

  const moveToNextFile = useCallback(() => {
    if (currentFile < content.length) {
      setCurrentFile(currentFile + 1);
    }
  }, [setCurrentFile, currentFile, content]);

  return (
    <>
      <h3 className={styles.paddedProductiveHeading03}>
        {t('addAttachment', 'Add Attachment')} {content.length > 1 && `(${currentFile} of ${content.length})`}
      </h3>
      <FilePreview
        content={content[currentFile - 1]}
        onCancelCapture={onCancelCapture}
        onSaveFile={onSaveFile}
        collectCaption={collectCaption}
        moveToNextFile={moveToNextFile}
      />
    </>
  );
};

interface FilePreviewProps {
  content: string;
  collectCaption: boolean;
  collectDescription?: boolean;
  onSaveFile?(dataUri: string, caption: string, description?: string): void;
  onCancelCapture?(): void;
  moveToNextFile: () => void;
}

function FilePreview(props: FilePreviewProps) {
  const [saving, setSaving] = useState(false);
  const [caption, setCaption] = useState('');
  const [description, setDescription] = useState('');
  const { t } = useTranslation();

  const saveImageOrPdf = useCallback(
    (e: SyntheticEvent) => {
      if (!saving) {
        e.preventDefault();
        props.onSaveFile?.(props.content, caption, description);
        setSaving(true);
        props.moveToNextFile();
      }
    },
    [props.onSaveFile, saving, caption],
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

  const updateDescription = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setDescription(e.target.value);
  }, []);

  return (
    <form onSubmit={saveImageOrPdf}>
      <div className={styles.overview}>
        <img src={props.content} />
        <div className={styles.imageDetails}>
          {props.collectCaption && (
            <div className={styles.captionFrame}>
              <TextInput
                id="caption"
                autoFocus
                labelText={t('imageName', 'Image name')}
                autoComplete="off"
                disabled={saving}
                placeholder={t('attachmentCaptionInstruction', 'Enter caption')}
                onChange={updateCaption}
              />
            </div>
          )}
          {/* {props.collectDescription && ( */}
          <TextArea
            id="description"
            autoFocus
            labelText={t('imageDescription', 'Image description')}
            autoComplete="off"
            disabled={saving}
            placeholder={t('attachmentCaptionInstruction', 'Enter caption')}
            onChange={updateDescription}
          />
          {/* )} */}
        </div>
      </div>
      <UserHasAccess privilege="Create Attachment">
        <ButtonSet className={styles.buttonSetOverrides}>
          <Button kind="secondary" size="lg" onClick={cancelCapture} disabled={saving}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button size="lg" onClick={saveImageOrPdf} disabled={saving}>
            {t('addAttachment', 'Add attachment')}
          </Button>
        </ButtonSet>
      </UserHasAccess>
    </form>
  );
}

export default FilePreviewContainer;
