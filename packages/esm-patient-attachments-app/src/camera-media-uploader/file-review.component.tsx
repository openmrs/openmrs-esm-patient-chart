import React, { SyntheticEvent, useCallback, useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, TextArea, TextInput, ModalHeader, ModalBody, ModalFooter } from '@carbon/react';
import { UserHasAccess } from '@openmrs/esm-framework';
import styles from './file-review.scss';
import { UploadedFile } from '../attachments-types';
import FileRegular from '../assets/file-regular.svg';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';

export interface FileReviewContainerProps {
  onCompletion: () => void;
}

const FileReviewContainer: React.FC<FileReviewContainerProps> = ({ onCompletion }) => {
  const { filesToUpload, clearData, setFilesToUpload } = useContext(CameraMediaUploaderContext);
  const { t } = useTranslation();
  const [currentFile, setCurrentFile] = useState(1);

  const moveToNextFile = useCallback(() => {
    if (currentFile < filesToUpload.length) {
      setCurrentFile(currentFile + 1);
    } else {
      onCompletion();
    }
  }, [setCurrentFile, currentFile, filesToUpload, onCompletion]);

  const handleSave = useCallback(
    (updatedFile: UploadedFile) => {
      setFilesToUpload((filesToUpload) =>
        filesToUpload.map((file, indx) => (indx === currentFile - 1 ? updatedFile : file)),
      );
      moveToNextFile();
    },
    [moveToNextFile, setFilesToUpload, currentFile],
  );

  return (
    <div className={styles.filePreviewContainer}>
      <ModalHeader className={styles.productiveHeading03}>
        {t('addAttachment', 'Add Attachment')}{' '}
        {filesToUpload.length > 1 && `(${currentFile} of ${filesToUpload.length})`}
      </ModalHeader>
      <FilePreview
        uploadedFile={filesToUpload[currentFile - 1]}
        clearData={clearData}
        onSaveFile={handleSave}
        moveToNextFile={moveToNextFile}
        collectDescription={filesToUpload[currentFile - 1].fileType === 'image'}
      />
    </div>
  );
};

interface FilePreviewProps {
  uploadedFile: UploadedFile;
  collectDescription?: boolean;
  onSaveFile: (dataUri: UploadedFile) => void;
  clearData?(): void;
  moveToNextFile: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ uploadedFile, collectDescription, onSaveFile, clearData }) => {
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
      clearData?.();
    },
    [clearData],
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
      <ModalBody className={styles.overview}>
        <img src={uploadedFile.fileType === 'image' ? uploadedFile.fileContent : FileRegular} alt="placeholder" />
        <div className={styles.imageDetails}>
          <div className={styles.captionFrame}>
            <TextInput
              id="caption"
              labelText={`${uploadedFile.fileType === 'image' ? t('image', 'Image') : t('file', 'File')} ${t(
                'name',
                'name',
              )}`}
              autoComplete="off"
              placeholder={t('attachmentCaptionInstruction', 'Enter caption')}
              onChange={updateFileName}
              required
              value={fileName}
              invalid={emptyName}
              autoFocus
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
      </ModalBody>
      <ModalFooter>
        <UserHasAccess privilege="Create Attachment">
          <Button kind="secondary" size="lg" onClick={cancelCapture}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit" size="lg" onClick={saveImageOrPdf} disabled={emptyName}>
            {t('addAttachment', 'Add attachment')}
          </Button>
        </UserHasAccess>
      </ModalFooter>
    </form>
  );
};

export default FileReviewContainer;
