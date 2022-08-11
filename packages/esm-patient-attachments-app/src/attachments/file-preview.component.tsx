import React, { SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserHasAccess } from '@openmrs/esm-framework';
import { Button, ButtonSet, TextArea, TextInput } from 'carbon-components-react';
import styles from './image-preview.scss';
import { UploadedFile } from './attachments-types';
import FileRegular from '../assets/file-regular.svg';

export interface FilePreviewContainerProps {
  uploadedFiles: Array<UploadedFile>;
  onSaveFile?: (dataUri: Array<UploadedFile>) => void;
  onCancelCapture?(): void;
}

const FilePreviewContainer: React.FC<FilePreviewContainerProps> = ({ uploadedFiles, onSaveFile, onCancelCapture }) => {
  const { t } = useTranslation();
  const [currentFile, setCurrentFile] = useState(1);
  const [selectedAttachments, setSelectedAttachments] = useState<Array<UploadedFile>>([]);

  const moveToNextFile = useCallback(() => {
    if (currentFile < uploadedFiles.length) {
      setCurrentFile(currentFile + 1);
    }
  }, [setCurrentFile, currentFile, uploadedFiles]);

  const handleSave = useCallback(
    (dataUri: UploadedFile) => {
      if (currentFile === uploadedFiles.length) {
        onSaveFile([...selectedAttachments, dataUri]);
      } else {
        setSelectedAttachments((selectedAttachments) => [...selectedAttachments, dataUri]);
        moveToNextFile();
      }
    },
    [moveToNextFile, setSelectedAttachments, uploadedFiles, selectedAttachments, currentFile, onSaveFile],
  );

  return (
    <div className={styles.filePreviewContainer}>
      <h3 className={styles.paddedProductiveHeading03}>
        {t('addAttachment', 'Add Attachment')}{' '}
        {uploadedFiles.length > 1 && `(${currentFile} of ${uploadedFiles.length})`}
      </h3>
      <FilePreview
        uploadedFile={uploadedFiles[currentFile - 1]}
        onCancelCapture={onCancelCapture}
        onSaveFile={handleSave}
        moveToNextFile={moveToNextFile}
        collectDescription={uploadedFiles[currentFile - 1].fileType === 'image'}
      />
    </div>
  );
};

interface FilePreviewProps {
  uploadedFile: UploadedFile;
  collectDescription?: boolean;
  onSaveFile: (dataUri: UploadedFile) => void;
  onCancelCapture?(): void;
  moveToNextFile: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ uploadedFile, collectDescription, onSaveFile, onCancelCapture }) => {
  const [fileName, setFileName] = useState('');
  const [fileDescription, setFileDescription] = useState('');
  const { t } = useTranslation();
  const [emptyName, setEmptyName] = useState(false);

  useEffect(() => {
    setFileName(uploadedFile.fileName);
    setFileDescription(uploadedFile.fileDescription);
  }, [uploadedFile]);

  const saveImageOrPdf = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault();
      onSaveFile?.({
        ...uploadedFile,
        fileName,
        fileDescription,
      });
    },
    [onSaveFile, fileName, fileDescription, uploadedFile],
  );

  const cancelCapture = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault();
      onCancelCapture?.();
    },
    [onCancelCapture],
  );

  const updateFileName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.value === '') {
        setEmptyName(true);
      } else if (emptyName) {
        setEmptyName(false);
      }
      setFileName(e.target.value);
    },
    [setEmptyName, setFileName, emptyName],
  );

  const updateDescription = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      setFileDescription(e.target.value);
    },
    [setFileDescription],
  );

  return (
    <form onSubmit={saveImageOrPdf}>
      <div className={styles.overview}>
        <img src={uploadedFile.fileType === 'image' ? uploadedFile.fileContent : FileRegular} alt="placeholder" />
        <div className={styles.imageDetails}>
          <div className={styles.captionFrame}>
            <TextInput
              id="caption"
              autoFocus
              labelText={t('imageName', 'Image name')}
              autoComplete="off"
              placeholder={t('attachmentCaptionInstruction', 'Enter caption')}
              onChange={updateFileName}
              required
              value={fileName}
              invalid={emptyName}
              invalidText={emptyName && t('fieldRequired', 'This field is required')}
            />
          </div>
          {collectDescription && (
            <TextArea
              id="description"
              labelText={t('imageDescription', 'Image description')}
              autoComplete="off"
              placeholder={t('attachmentCaptionInstruction', 'Enter caption')}
              value={fileDescription}
              onChange={updateDescription}
            />
          )}
        </div>
      </div>
      <UserHasAccess privilege="Create Attachment">
        <ButtonSet className={styles.buttonSetOverrides}>
          <Button kind="secondary" size="lg" onClick={cancelCapture}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit" size="lg" onClick={saveImageOrPdf} disabled={emptyName}>
            {t('addAttachment', 'Add attachment')}
          </Button>
        </ButtonSet>
      </UserHasAccess>
    </form>
  );
};

export default FilePreviewContainer;
