import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { Close } from '@carbon/react/icons';
import { Attachment } from '../attachments-types';
import styles from './attachments-grid-overview.scss';

interface ImagePreviewProps {
  closePreview: any;
  imageSelected: Attachment;
  deleteAttachment: (attachment: Attachment) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ closePreview, imageSelected, deleteAttachment }) => {
  const { t } = useTranslation();

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
          <img src={imageSelected.src} alt={imageSelected.title} />
        </div>
        <div className={styles.overflowMenu}>
          <Button kind="danger" onClick={() => deleteAttachment(imageSelected)}>
            {t('deleteImage', 'Delete image')}
          </Button>
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
