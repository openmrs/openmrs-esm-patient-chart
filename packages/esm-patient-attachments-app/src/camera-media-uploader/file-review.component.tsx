import React, { type SyntheticEvent, useCallback, useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, ModalBody, ModalFooter, ModalHeader, Stack, TextArea, TextInput } from '@carbon/react';
import { DocumentPdf, DocumentUnknown } from '@carbon/react/icons';
import { type UploadedFile, UserHasAccess } from '@openmrs/esm-framework';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';
import styles from './file-review.scss';

export interface FileReviewContainerProps {
  onCompletion: () => void;
}

interface FilePreviewProps {
  clearData?(): void;
  collectDescription?: boolean;
  moveToNextFile: () => void;
  onSaveFile: (dataUri: UploadedFile) => void;
  uploadedFile: UploadedFile;
}

const FileReviewContainer: React.FC<FileReviewContainerProps> = ({ onCompletion }) => {
  const { t } = useTranslation();
  const [currentFile, setCurrentFile] = useState(1);

  const { clearData, closeModal, collectDescription, filesToUpload, setFilesToUpload } =
    useContext(CameraMediaUploaderContext);

  const moveToNextFile = useCallback(() => {
    if (currentFile < filesToUpload.length) {
      setCurrentFile(currentFile + 1);
    } else {
      onCompletion();
    }
  }, [setCurrentFile, currentFile, filesToUpload, onCompletion]);

  const handleSave = useCallback(
    (updatedFile: UploadedFile) => {
      setFilesToUpload((filesToUpload) => filesToUpload.map((file, i) => (i === currentFile - 1 ? updatedFile : file)));
      moveToNextFile();
    },
    [moveToNextFile, setFilesToUpload, currentFile],
  );

  return (
    <div className={styles.filePreviewContainer}>
      <ModalHeader closeModal={closeModal} className={styles.productiveHeading03}>
        {t('addAttachment_title', 'Add Attachment')}{' '}
        {filesToUpload.length > 1 && `(${currentFile} of ${filesToUpload.length})`}
      </ModalHeader>
      <FilePreview
        key={filesToUpload[currentFile - 1]?.fileName}
        clearData={clearData}
        collectDescription={filesToUpload[currentFile - 1].fileType === 'image' && collectDescription}
        moveToNextFile={moveToNextFile}
        onSaveFile={handleSave}
        uploadedFile={filesToUpload[currentFile - 1]}
      />
    </div>
  );
};

const FilePreview: React.FC<FilePreviewProps> = ({ uploadedFile, collectDescription, onSaveFile, clearData }) => {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState(uploadedFile.fileName);
  const [fileDescription, setFileDescription] = useState(uploadedFile.fileDescription);
  const [emptyName, setEmptyName] = useState(false);

  const saveImageOrPdf = useCallback(
    (event: SyntheticEvent) => {
      event.preventDefault();
      onSaveFile?.({
        ...uploadedFile,
        fileName,
        fileDescription,
      });
    },
    [onSaveFile, fileName, fileDescription, uploadedFile],
  );

  const cancelCapture = useCallback(
    (event: SyntheticEvent) => {
      event.preventDefault();
      clearData?.();
    },
    [clearData],
  );

  const updateFileName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();

      if (event.target.value === '') {
        setEmptyName(true);
      } else if (emptyName) {
        setEmptyName(false);
      }

      setFileName(event.target.value);
    },
    [setEmptyName, setFileName, emptyName],
  );

  const updateDescription = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      event.preventDefault();
      setFileDescription(event.target.value);
    },
    [setFileDescription],
  );

  return (
    <Form onSubmit={saveImageOrPdf}>
      <ModalBody className={styles.overview}>
        {uploadedFile.fileType === 'image' ? (
          <img src={uploadedFile.base64Content} alt="placeholder" />
        ) : uploadedFile.fileType === 'pdf' ? (
          <div className={styles.filePlaceholder}>
            <DocumentPdf size={16} />
          </div>
        ) : (
          <div className={styles.filePlaceholder}>
            <DocumentUnknown size={16} />
          </div>
        )}
        <div className={styles.imageDetails}>
          <Stack gap={5}>
            <div className={styles.captionFrame}>
              <TextInput
                autoComplete="off"
                autoFocus
                id="caption"
                invalid={emptyName}
                invalidText={emptyName && t('fieldRequired', 'This field is required')}
                labelText={`${uploadedFile.fileType === 'image' ? t('image', 'Image') : t('file', 'File')} ${t(
                  'name',
                  'name',
                )}`}
                onChange={updateFileName}
                placeholder={t('attachmentCaptionInstruction', 'Enter caption')}
                required
                value={fileName}
              />
            </div>
            {collectDescription && (
              <TextArea
                autoComplete="off"
                id="description"
                labelText={t('imageDescription', 'Image description')}
                onChange={updateDescription}
                placeholder={t('attachmentCaptionInstruction', 'Enter caption')}
                value={fileDescription}
              />
            )}
          </Stack>
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
    </Form>
  );
};

export default FileReviewContainer;
