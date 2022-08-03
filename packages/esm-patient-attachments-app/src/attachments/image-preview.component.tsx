import React from 'react';
import styles from './attachments-grid-overview.scss';
import { Attachment } from './attachments-types';
import { Button, OverflowMenu, OverflowMenuItem } from 'carbon-components-react';
import Close from '@carbon/icons-react/es/close/24';
import { useTranslation } from 'react-i18next';

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
        <p className={`${styles.bodyLong01} ${styles.imageDescription}`}>Description</p>
      </div>
    </div>
  );
};

export default ImagePreview;
