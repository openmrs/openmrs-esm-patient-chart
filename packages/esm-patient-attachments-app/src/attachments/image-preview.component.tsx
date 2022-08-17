import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { Close } from '@carbon/react/icons';
import { Attachment } from '../attachments-types';
import styles from './image-preview.scss';

interface ImagePreviewProps {
  closePreview: any;
  imageSelected: Attachment;
  deleteAttachment: (attachment: Attachment) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ closePreview, imageSelected, deleteAttachment }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const onKeyDown = (evt) => {
      console.log(evt.key);
      if (evt.key == 'Escape') {
        closePreview();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [closePreview]);

  return (
    <div className={styles.imagePreview}>
      <div className={styles.leftPanel}>
        <Button
          iconDescription={t('closePreview', 'Close preview')}
          label={t('closePreview', 'Close preview')}
          kind="ghost"
          className={styles.closePreviewButton}
          hasIconOnly
          renderIcon={Close}
          onClick={closePreview}
        />
        <div className={styles.attachmentImage}>
          {imageSelected.bytesContentFamily === 'IMAGE' ? (
            <img src={imageSelected.src} alt={imageSelected.title} />
          ) : imageSelected.bytesContentFamily === 'PDF' ? (
            <iframe className={styles.pdfViewer} src={imageSelected.src} />
          ) : null}
        </div>
        <div className={styles.overflowMenu}>
          <OverflowMenu className={styles.overflowMenu}>
            <OverflowMenuItem
              hasDivider
              isDelete
              itemText={t('deleteImage', 'Delete image')}
              onClick={() => deleteAttachment(imageSelected)}
            />
          </OverflowMenu>
        </div>
      </div>
      <div className={styles.rightPanel}>
        <h4 className={styles.productiveHeading02}>{imageSelected.title}</h4>
        {imageSelected?.description ? (
          <p className={`${styles.bodyLong01} ${styles.imageDescription}`}>{imageSelected.description}</p>
        ) : null}
      </div>
    </div>
  );
};

export default ImagePreview;
