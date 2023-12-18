import React, { useContext, useCallback } from 'react';
import { FileUploaderDropContainer } from '@carbon/react';
import styles from './media-uploader.scss';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';
import { readFileAsString } from '../utils';
import { useTranslation } from 'react-i18next';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
const MediaUploaderComponent = () => {
  const { setFilesToUpload, allowedExtensions, multipleFiles } = useContext(CameraMediaUploaderContext);
  const { t } = useTranslation();
  const { fileSize } = useConfig();

  const upload = useCallback(
    (files: Array<File>) => {
      files.forEach((file) => {
        if (file.size <= fileSize * 1024 * 1024) {
          // Changing MB to bytes
          readFileAsString(file).then((base64Content) => {
            setFilesToUpload((uriData) => [
              ...uriData,
              {
                base64Content,
                file,
                fileName: file.name,
                fileType:
                  file.type.split('/')[0] === 'image' ? 'image' : file.type.split('/')[1] === 'pdf' ? 'pdf' : 'other',
                fileDescription: '',
                status: 'uploading',
              },
            ]);
          });
        } else {
          showSnackbar({
            title: t('fileSizeLimitExceededText', 'File size limit exceeded'),
            subtitle: `${file.name} ${t('fileSizeLimitExceeded', 'exceeds the file size of')} ${fileSize} MB`,
            kind: 'error',
          });
        }
      });
    },
    [setFilesToUpload, fileSize, t],
  );

  return (
    <div className="cds--file__container">
      <p className="cds--label-description">
        {t('fileUploadSizeConstraints', 'File limit is {{fileSize}}MB', {
          fileSize,
        })}
      </p>
      <div className={styles.uploadFile}>
        <FileUploaderDropContainer
          accept={allowedExtensions ?? ['*']}
          labelText={t('fileSizeInstructions', 'Drag and drop files here or click to upload')}
          tabIndex={0}
          multiple={multipleFiles}
          onAddFiles={(evt, { addedFiles }) => {
            upload(addedFiles);
          }}
        />
      </div>
    </div>
  );
};

export default MediaUploaderComponent;
