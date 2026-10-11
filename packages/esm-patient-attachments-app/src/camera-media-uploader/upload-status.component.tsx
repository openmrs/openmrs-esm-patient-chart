import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, FileUploaderItem, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';
import styles from './upload-status.scss';

interface UploadStatusComponentProps {
  title?: string;
}

type UploadState = 'uploading' | 'complete' | 'failed';

interface FileUploadState {
  fileName: string;
  status: UploadState;
}

const UploadStatusComponent: React.FC<UploadStatusComponentProps> = ({ title }) => {
  const { t } = useTranslation();
  const { filesToUpload, saveFile, closeModal, clearData, onCompletion, showUploadSnackbar } =
    useContext(CameraMediaUploaderContext);
  const [filesUploading, setFilesUploading] = useState<Array<FileUploadState>>(() =>
    filesToUpload.map((file) => ({
      fileName: file.fileName,
      status: 'uploading',
    })),
  );
  const [isRetrying, setIsRetrying] = useState(false);
  const startedUpload = useRef(false);
  const completionNotified = useRef(false);

  const uploadFiles = useCallback(
    async (indexes: Array<number>) => {
      if (!indexes.length) {
        return true;
      }

      setFilesUploading((previous) =>
        previous.map((file, index) => (indexes.includes(index) ? { ...file, status: 'uploading' } : file)),
      );

      const results = await Promise.all(
        indexes.map(async (index) => {
          const file = filesToUpload[index];

          try {
            await saveFile(file);

            if (showUploadSnackbar !== false) {
              showSnackbar({
                title: t('uploadComplete', 'Upload complete'),
                subtitle: `${file.fileName} ${t('uploadedSuccessfully', 'uploaded successfully')}`,
                kind: 'success',
                isLowContrast: true,
              });
            }

            setFilesUploading((previous) =>
              previous.map((upload, uploadIndex) =>
                uploadIndex === index ? { ...upload, status: 'complete' } : upload,
              ),
            );
            return true;
          } catch (error) {
            setFilesUploading((previous) =>
              previous.map((upload, uploadIndex) =>
                uploadIndex === index ? { ...upload, status: 'failed' } : upload,
              ),
            );
            showSnackbar({
              kind: 'error',
              subtitle: error?.message,
              title: `${t('uploading', 'Uploading')} ${file.fileName} ${t('failed', 'failed')}`,
            });
            return false;
          }
        }),
      );

      return results.every(Boolean);
    },
    [filesToUpload, saveFile, showUploadSnackbar, t],
  );

  useEffect(() => {
    if (startedUpload.current || !filesToUpload.length) {
      return;
    }

    startedUpload.current = true;
    const indexes = filesToUpload.map((_, index) => index);
    void uploadFiles(indexes);
  }, [filesToUpload, uploadFiles]);

  useEffect(() => {
    if (
      !completionNotified.current &&
      filesUploading.length > 0 &&
      filesUploading.every((file) => file.status === 'complete')
    ) {
      completionNotified.current = true;
      onCompletion?.();
    }
  }, [filesUploading, onCompletion]);

  const failedIndexes = useMemo(
    () =>
      filesUploading.reduce<Array<number>>((indexes, file, index) => {
        if (file.status === 'failed') {
          indexes.push(index);
        }
        return indexes;
      }, []),
    [filesUploading],
  );

  const retryFailedUploads = useCallback(async () => {
    if (!failedIndexes.length || isRetrying) {
      return;
    }

    setIsRetrying(true);
    try {
      await uploadFiles(failedIndexes);
    } finally {
      setIsRetrying(false);
    }
  }, [failedIndexes, isRetrying, uploadFiles]);

  return (
    <div className={styles.cameraSection}>
      <ModalHeader
        closeModal={closeModal}
        className={styles.modalHeader}
        title={title || t('addAttachment_title', 'Add Attachment')}
      />
      <ModalBody>
        <p className="cds--label-description">
          {t(
            'uploadWillContinueInTheBackground',
            'Files will be uploaded in the background. You can close this modal.',
          )}
        </p>

        <div className={styles.uploadingFilesSection}>
          {filesUploading.map((file, index) => (
            <div key={`${file.fileName}-${index}`}>
              <FileUploaderItem
                name={file.fileName}
                status={file.status === 'failed' ? 'edit' : file.status}
                size="lg"
              />
              {file.status === 'failed' ? <p>{t('uploadFailed', 'Upload failed')}</p> : null}
            </div>
          ))}
        </div>

        {failedIndexes.length > 0 ? (
          <Button kind="ghost" size="sm" disabled={isRetrying} onClick={retryFailedUploads}>
            {isRetrying ? t('retrying', 'Retrying...') : t('retryFailedUploads', 'Retry failed uploads')}
          </Button>
        ) : null}
      </ModalBody>
      <ModalFooter>
        <ButtonSet className={styles.buttonSet}>
          <Button size="lg" kind="secondary" onClick={clearData}>
            {t('addMoreAttachments', 'Add more attachments')}
          </Button>
          <Button size="lg" kind="primary" onClick={closeModal}>
            {t('closeModal', 'Close')}
          </Button>
        </ButtonSet>
      </ModalFooter>
    </div>
  );
};

export default UploadStatusComponent;
