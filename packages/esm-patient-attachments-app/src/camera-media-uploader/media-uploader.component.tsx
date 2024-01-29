import React, { useContext, useCallback } from 'react';
import { FileUploaderDropContainer } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import { readFileAsString } from '../utils';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';
import styles from './media-uploader.scss';

const MediaUploaderComponent = () => {
  const { setFilesToUpload, allowedExtensions, multipleFiles } = useContext(CameraMediaUploaderContext);
  const { t } = useTranslation();
  const { fileSize } = useConfig();

  const upload = useCallback(
    (files: Array<File>) => {
      files.forEach((file) => {
        if (file.size > fileSize * 1024 * 1024) {
          showSnackbar({
            title: t('fileSizeLimitExceededText', 'File size limit exceeded'),
            subtitle: `${file.name} ${t('fileSizeLimitExceeded', 'exceeds the file size of')} ${fileSize} MB`,
            kind: 'error',
          });
        } else if (!isFileExtensionAllowed(file.name, allowedExtensions)) {
          showSnackbar({
            title: t('fileExtensionNotAllowedText', 'File extension is not allowed'),
            subtitle: `${file.name} ${t('allowedExtensionsAre', 'Allowed extensions are:')} ${allowedExtensions}`,
            kind: 'error',
          });
        } else {
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
        }
      });
    },
    [setFilesToUpload, fileSize, t],
  );

  const isFileExtensionAllowed = (fileName: string, allowedExtensions: string[]): boolean => {
    if (!allowedExtensions) {
      return true;
    }
    const fileExtension = fileName.split('.').pop();
    return allowedExtensions?.includes(fileExtension);
  };

  return (
    <div className="cds--file__container">
      <p className="cds--label-description">
        {t('fileUploadSizeConstraints', 'Size limit is {{fileSize}}MB', {
          fileSize,
        })}
        . {t('supportedFileTypes', 'Supported file types are: JPEG, PNG, and WEBP')}.
      </p>
      <div className={styles.uploadFile}>
        <FileUploaderDropContainer
          accept={allowedExtensions?.map((ext) => '.' + ext) || ['*']}
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
