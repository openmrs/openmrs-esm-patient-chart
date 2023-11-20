import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@openmrs/esm-framework';
import styles from './uploading-status.scss';
import { FileUploaderItem, Button, ButtonSet, ModalHeader, ModalBody, ModalFooter } from '@carbon/react';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';

interface UploadingStatusComponentProps {}

const UploadingStatusComponent: React.FC<UploadingStatusComponentProps> = () => {
  const { t } = useTranslation();
  const { filesToUpload, saveFile, closeModal, clearData, onCompletion } = useContext(CameraMediaUploaderContext);
  const [filesUploading, setFilesUploading] = useState([]);

  useEffect(() => {
    if (filesToUpload) {
      setFilesUploading(
        filesToUpload.map((file) => ({
          ...file,
          status: 'uploading',
        })),
      );
    }
  }, [filesToUpload, setFilesUploading]);

  useEffect(() => {
    Promise.all(
      filesToUpload.map((file, indx) =>
        saveFile(file)
          .then(() => {
            showSnackbar({
              title: t('uploadComplete', 'Upload complete'),
              subtitle: `${file.fileName} ${t('uploadedSuccessfully', 'uploaded successfully')}`,
              kind: 'success',
              isLowContrast: true,
            });
            setFilesUploading((prevfilesToUpload) =>
              prevfilesToUpload.map((file, ind) =>
                ind === indx
                  ? {
                      ...file,
                      status: 'complete',
                    }
                  : file,
              ),
            );
          })
          .catch((err) => {
            showSnackbar({
              title: `${t('uploading', 'Uploading')} ${file.fileName} ${t('failed', 'failed')}`,
              subtitle: err,
              kind: 'error',
            });
          }),
      ),
    ).then(() => {
      true;
      onCompletion?.();
    });
  }, [onCompletion, saveFile, filesToUpload, t, setFilesUploading]);

  return (
    <div className={styles.cameraSection}>
      <ModalHeader
        closeModal={closeModal}
        className={styles.productiveHeading03}
        title={t('addAttachment_title', 'Add Attachment')}
      />
      <ModalBody>
        <p className="cds--label-description">
          {t(
            'uploadWillContinueInTheBackground',
            'Files will be uploaded in the background. You can close this modal.',
          )}
        </p>

        <div className={styles.uploadingFilesSection}>
          {filesUploading.map((file, key) => (
            <FileUploaderItem key={key} name={file.fileName} status={file.status} size="lg" />
          ))}
        </div>
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

export default UploadingStatusComponent;
