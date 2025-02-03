import React, { useCallback, useContext, useState } from 'react';
import { FileUploaderDropContainer, InlineNotification } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import { readFileAsString } from '../utils';
import { useAllowedFileExtensions } from '@openmrs/esm-patient-common-lib';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';
import styles from './media-uploader.scss';

interface ErrorNotification {
  title: string;
  subtitle: string;
}

const MediaUploaderComponent = () => {
  const { t } = useTranslation();
  const { maxFileSize } = useConfig();
  const { setFilesToUpload, multipleFiles } = useContext(CameraMediaUploaderContext);
  const { allowedFileExtensions } = useAllowedFileExtensions();
  const [errorNotification, setErrorNotification] = useState<ErrorNotification>(null);

  const upload = useCallback(
    (files: Array<File>) => {
      files.forEach((file) => {
        if (file.size > maxFileSize * 1024 * 1024) {
          setErrorNotification({
            title: t('fileSizeLimitExceededText', 'File size limit exceeded'),
            subtitle: `The file "${file.name}" ${t(
              'fileSizeLimitExceeded',
              'exceeds the size limit of',
            )} ${maxFileSize} MB.`,
          });
        } else if (!isFileExtensionAllowed(file.name, allowedFileExtensions)) {
          const lastExtension = allowedFileExtensions.pop();

          setErrorNotification({
            title: t('unsupportedFileType', 'Unsupported file type'),
            subtitle: t(
              'chooseAnAllowedFileType',
              'The file "{{fileName}}" cannot be uploaded. Please upload a file with one of the following extensions: {{supportedExtensions}}, or {{ lastExtension }}.',
              {
                fileName: file.name,
                lastExtension: lastExtension,
                supportedExtensions: allowedFileExtensions.join(', '),
              },
            ),
          });
        } else {
          // Convert MBs to bytes
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
    [setFilesToUpload, maxFileSize, t, allowedFileExtensions],
  );

  const isFileExtensionAllowed = (fileName: string, allowedFileExtensions: string[]): boolean => {
    if (!allowedFileExtensions) {
      return true;
    }

    const fileExtension = fileName.split('.').pop();
    return allowedFileExtensions?.includes(fileExtension.toLowerCase());
  };

  return (
    <div className="cds--file__container">
      {errorNotification && (
        <div className={styles.errorContainer}>
          <InlineNotification
            aria-label="Upload error notification"
            kind="error"
            onClose={() => setErrorNotification(null)}
            subtitle={errorNotification.subtitle}
            title={errorNotification.title}
          />
        </div>
      )}
      <p className="cds--label-description">
        {t('fileUploadSizeConstraints', 'Size limit is {{fileSize}}MB', {
          fileSize: maxFileSize,
        })}
        .{' '}
        {t('supportedFiletypes', 'Supported files are {{supportedFiles}}', {
          supportedFiles: allowedFileExtensions?.join(', '),
        })}
        .
      </p>
      <div className={styles.uploadFile}>
        <FileUploaderDropContainer
          accept={allowedFileExtensions?.map((ext) => '.' + ext) || ['*']}
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
