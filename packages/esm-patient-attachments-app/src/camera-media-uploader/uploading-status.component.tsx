import React, { useState, useCallback, useEffect, Dispatch, SetStateAction, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { showToast, FetchResponse } from '@openmrs/esm-framework';
import { UploadedFile } from '../attachments-types';
import styles from './uploading-status.scss';
import { FileUploaderItem, Button, ButtonSet } from 'carbon-components-react';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';

interface UploadingStatusComponentProps {}

const UploadingStatusComponent: React.FC<UploadingStatusComponentProps> = () => {
  const { t } = useTranslation();
  const [uploadingCompleted, setUploadingComplete] = useState(false);
  const { filesToUpload, saveFile, setFilesToUpload, closeModal, clearData, onCompletion } =
    useContext(CameraMediaUploaderContext);

  useEffect(() => {
    Promise.all(
      filesToUpload.map((file, indx) =>
        saveFile(file).then(() => {
          showToast({
            title: t('uploadComplete', 'Upload complete'),
            description: `${file.fileName} ${t('uploadedSuccessfully', 'uploaded successfully')}`,
            kind: 'success',
          });
          setFilesToUpload((prevfilesToUpload) =>
            prevfilesToUpload.map((file, ind) =>
              ind === indx
                ? {
                    ...file,
                    status: 'complete',
                  }
                : file,
            ),
          );
        }),
      ),
    ).then(() => {
      setUploadingComplete(true);
      onCompletion?.();
    });
  }, [onCompletion, saveFile, filesToUpload, t, setFilesToUpload]);

  return (
    <div className={styles.cameraSection}>
      <h3 className={styles.paddedProductiveHeading03}>{t('addAttachment', 'Add Attachment')}</h3>
      <div className={styles.uploadingFilesSection}>
        {filesToUpload.map((file) => (
          <FileUploaderItem name={file.fileName} status={file.status} size="lg" />
        ))}
      </div>
      {uploadingCompleted && (
        <ButtonSet className={styles.buttonSet}>
          <Button size="lg" kind="secondary" onClick={clearData}>
            {t('addMoreAttachments', 'Add more attachments')}
          </Button>
          <Button size="lg" kind="primary" onClick={closeModal}>
            {t('closeModal', 'Close')}
          </Button>
        </ButtonSet>
      )}
    </div>
  );
};

export default UploadingStatusComponent;
