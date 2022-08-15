import React, { useContext, useCallback } from 'react';
import { FileUploaderDropContainer } from '@carbon/react';
import styles from './media-uploader.scss';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';
import { readFileAsString } from '../utils';
import { useTranslation } from 'react-i18next';
const MediaUploaderComponent = () => {
  const { setFilesToUpload } = useContext(CameraMediaUploaderContext);
  const { t } = useTranslation();
  const upload = useCallback(
    (files: Array<File>) => {
      files.forEach((file) =>
        readFileAsString(file).then((fileContent) => {
          setFilesToUpload((uriData) => [
            ...uriData,
            {
              fileContent,
              fileName: file.name,
              fileType: file.type === 'application/pdf' ? 'pdf' : 'image',
              fileDescription: '',
              status: 'uploading',
            },
          ]);
        }),
      );
    },
    [setFilesToUpload],
  );

  return (
    <div className="cds--file__container">
      <p className="cds--label-description">{t('fileUploadTypes', 'Only images and pdf files. 500kb max file size')}</p>
      <div className={styles.uploadFile}>
        <FileUploaderDropContainer
          accept={['image/*', 'application/pdf']}
          labelText={t('fileUploadInstructions', 'Drag and drop files here or click to upload')}
          tabIndex={0}
          multiple
          onAddFiles={(evt, { addedFiles }) => {
            upload(addedFiles);
          }}
        />
      </div>
    </div>
  );
};

export default MediaUploaderComponent;
