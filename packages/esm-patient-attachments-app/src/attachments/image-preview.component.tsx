import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { Close } from '@carbon/react/icons';
import { type Attachment, useLayoutType } from '@openmrs/esm-framework';
import styles from './image-preview.scss';

interface AttachmentPreviewProps {
  closePreview: any;
  attachmentToPreview: Attachment;
  deleteAttachment: (attachment: Attachment) => void;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  closePreview,
  attachmentToPreview,
  deleteAttachment,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  useEffect(() => {
    const closePreviewOnEscape = (evt) => {
      if (evt.key == 'Escape') {
        closePreview();
      }
    };

    window.addEventListener('keydown', closePreviewOnEscape);

    return () => {
      window.removeEventListener('keydown', closePreviewOnEscape);
    };
  }, [closePreview]);

  return (
    <div className={styles.attachmentPreview}>
      <div className={styles.leftPanel}>
        <Button
          iconDescription={t('closePreview', 'Close preview')}
          label={t('closePreview', 'Close preview')}
          kind="ghost"
          size="md"
          className={styles.closePreviewButton}
          hasIconOnly
          renderIcon={Close}
          onClick={closePreview}
        />
        <div className={styles.attachmentImage}>
          {attachmentToPreview.bytesContentFamily === 'IMAGE' ? (
            <img src={attachmentToPreview.src} alt={attachmentToPreview.title} />
          ) : attachmentToPreview.bytesContentFamily === 'PDF' ? (
            <iframe title="PDFViewer" className={styles.pdfViewer} src={attachmentToPreview.src} />
          ) : null}
        </div>
        <div className={styles.overflowMenu}>
          <OverflowMenu className={styles.overflowMenu} flipped size={isTablet ? 'lg' : 'md'}>
            <OverflowMenuItem
              className={styles.menuItem}
              hasDivider
              isDelete
              itemText={t('deleteImage', 'Delete image')}
              onClick={() => deleteAttachment(attachmentToPreview)}
            />
          </OverflowMenu>
        </div>
      </div>
      <div className={styles.rightPanel}>
        {attachmentToPreview?.title ? (
          <p className={classNames(styles.bodyLong01, styles.imageDescription)}>{attachmentToPreview.title}</p>
        ) : null}
      </div>
    </div>
  );
};

export default AttachmentPreview;
