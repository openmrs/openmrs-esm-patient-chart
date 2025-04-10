import React, { type SyntheticEvent, useCallback, useState, useContext } from 'react';
import { Button, Form, ModalBody, ModalFooter, ModalHeader, Stack, TextArea, TextInput } from '@carbon/react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { DocumentPdf, DocumentUnknown } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAllowedFileExtensions } from '@openmrs/esm-patient-common-lib';
import { getCoreTranslation, type UploadedFile, UserHasAccess } from '@openmrs/esm-framework';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';
import styles from './file-review.scss';

export interface FileReviewContainerProps {
  onCompletion: () => void;
  title?: string;
}

interface FilePreviewProps {
  clearData?(): void;
  collectDescription?: boolean;
  moveToNextFile: () => void;
  onSaveFile: (dataUri: UploadedFile) => void;
  title?: string;
  // TODO: Constrain the file type to a more specific type that only allows image and pdf
  uploadedFile: UploadedFile;
  closeModal: () => void;
}

const FileReviewContainer: React.FC<FileReviewContainerProps> = ({ title, onCompletion }) => {
  const { t } = useTranslation();
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  const { clearData, closeModal, collectDescription, filesToUpload, setFilesToUpload } =
    useContext(CameraMediaUploaderContext);

  const moveToNextFile = useCallback(() => {
    if (currentFileIndex < filesToUpload.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
    } else {
      onCompletion();
    }
  }, [setCurrentFileIndex, currentFileIndex, filesToUpload, onCompletion]);

  const handleSave = useCallback(
    (updatedFile: UploadedFile) => {
      setFilesToUpload((filesToUpload) =>
        filesToUpload.map((file, i) => (i === currentFileIndex ? updatedFile : file)),
      );
      moveToNextFile();
    },
    [moveToNextFile, setFilesToUpload, currentFileIndex],
  );

  const handleClose = useCallback(() => setShowWarningDialog(true), []);

  return (
    <div>
      {showWarningDialog ? (
        <div>
          <ModalHeader closeModal={closeModal} title={t('unsavedAttachment', 'Unsaved attachment')} />
          <ModalBody>
            <p className={styles.bodyShort02}>
              {t('unsavedAttachmentMessage', 'You have an unsaved attachment. Are you sure you want to discard it?')}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button kind="secondary" onClick={() => setShowWarningDialog(false)}>
              {t('keepAttachment', 'Keep attachment')}
            </Button>
            <Button
              kind="danger"
              onClick={() => {
                closeModal();
                clearData?.();
                setShowWarningDialog(false);
              }}
            >
              {getCoreTranslation('discard')}
            </Button>
          </ModalFooter>
        </div>
      ) : (
        <div className={styles.filePreviewContainer}>
          <ModalHeader closeModal={handleClose} className={styles.modalHeader}>
            {title || t('addAttachment_title', 'Add Attachment')}{' '}
            {filesToUpload.length > 1 && `(${currentFileIndex + 1} of ${filesToUpload.length})`}
          </ModalHeader>
          <FilePreview
            clearData={clearData}
            closeModal={handleClose}
            collectDescription={filesToUpload[currentFileIndex].fileType === 'image' && collectDescription}
            key={`${filesToUpload[currentFileIndex]?.fileName}-${currentFileIndex}`}
            moveToNextFile={moveToNextFile}
            onSaveFile={handleSave}
            title={title}
            uploadedFile={filesToUpload[currentFileIndex]}
          />
        </div>
      )}
    </div>
  );
};

const FilePreview: React.FC<FilePreviewProps> = ({
  title,
  uploadedFile,
  collectDescription,
  onSaveFile,
  clearData,
  closeModal,
}) => {
  const { t } = useTranslation();
  const { allowedFileExtensions } = useAllowedFileExtensions();
  const fileNameWithoutExtension = uploadedFile.fileName.trim().replace(/\.[^\\/.]+$/, '');

  const schema = z.object({
    fileName: z
      .string({
        required_error: t('nameIsRequired', 'Name is required'),
      })
      .min(1),
    fileDescription: z.string().optional(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      fileName: fileNameWithoutExtension,
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = (data) => {
    const { fileName, fileDescription } = data;

    const sanitizedFileName =
      allowedFileExtensions?.reduce((name, extension) => {
        const regex = new RegExp(`\\.(${extension})+$`, 'i');
        return name.replace(regex, '');
      }, fileName) || fileName;

    onSaveFile?.({
      ...uploadedFile,
      fileName: `${sanitizedFileName}${fileExtension}`,
      fileDescription: fileDescription ?? '',
    });
  };

  const getFileExtension = useCallback((filename: string): string => {
    const validExtension = filename.match(/\.[0-9a-z]+$/i);
    return validExtension ? validExtension[0].toLowerCase() : '';
  }, []);

  const fileExtension = getFileExtension(uploadedFile.fileName);

  const handleCancelUpload = useCallback(
    (event: SyntheticEvent) => {
      event.preventDefault();
      closeModal();
    },
    [closeModal],
  );

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <ModalBody className={styles.overview}>
        {uploadedFile.fileType === 'image' ? (
          <img src={uploadedFile.base64Content} alt={t('imagePlaceholder', 'Image placeholder')} />
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
              <Controller
                control={control}
                name="fileName"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    autoFocus
                    id="caption"
                    invalid={!!errors.fileName}
                    invalidText={errors.fileName?.message}
                    labelText={`${uploadedFile.fileType === 'image' ? t('image', 'Image') : t('file', 'File')} ${t(
                      'name',
                      'name',
                    )}`}
                    onChange={onChange}
                    placeholder={t('enterAttachmentName', 'Enter attachment name')}
                    value={value}
                  />
                )}
              />
            </div>
            {collectDescription && (
              <Controller
                control={control}
                name="fileDescription"
                render={({ field: { onChange, value } }) => (
                  <TextArea
                    id="description"
                    labelText={t('imageDescription', 'Image description')}
                    onChange={onChange}
                    placeholder={t('enterAttachmentDescription', 'Enter attachment description')}
                    value={value}
                  />
                )}
              />
            )}
          </Stack>
        </div>
      </ModalBody>
      <ModalFooter>
        <UserHasAccess privilege="Create Attachment">
          <Button kind="secondary" onClick={handleCancelUpload} size="lg">
            {getCoreTranslation('cancel')}
          </Button>
          <Button type="submit" size="lg">
            {title || t('addAttachment', 'Add attachment')}
          </Button>
        </UserHasAccess>
      </ModalFooter>
    </Form>
  );
};

export default FileReviewContainer;
