import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { Close } from '@carbon/react/icons';
import { type Attachment, useLayoutType } from '@openmrs/esm-framework';
import styles from './attachment-preview.scss';

interface AttachmentPreviewProps {
  attachmentToPreview: Attachment;
  onClosePreview: () => void;
  onDeleteAttachment: (attachment: Attachment) => void;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachmentToPreview,
  onClosePreview,
  onDeleteAttachment,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const isPdf = attachmentToPreview.bytesContentFamily === 'PDF';
  const isImage = attachmentToPreview.bytesContentFamily === 'IMAGE';
  const responsiveSize = isTablet ? 'lg' : 'md';

  useEffect(() => {
    const closePreviewOnEscape = (event) => {
      if (event.key == 'Escape') {
        onClosePreview();
      }
    };

    window.addEventListener('keydown', closePreviewOnEscape);

    return () => {
      window.removeEventListener('keydown', closePreviewOnEscape);
    };
  }, [onClosePreview]);

  return (
    <div className={styles.previewContainer}>
      <div className={styles.leftPanel}>
        <Button
          className={styles.closePreviewButton}
          hasIconOnly
          iconDescription={t('closePreview', 'Close preview')}
          kind="ghost"
          label={t('closePreview', 'Close preview')}
          onClick={onClosePreview}
          renderIcon={Close}
          size={responsiveSize}
        />
        <div className={styles.attachmentPreview}>
          {isImage ? (
            <img src={attachmentToPreview.src} alt={attachmentToPreview.filename} />
          ) : isPdf ? (
            <iframe className={styles.pdfViewer} src={attachmentToPreview.src} title="PDFViewer" />
          ) : null}
        </div>
        <OverflowMenu className={styles.overflowMenu} flipped size={responsiveSize}>
          <OverflowMenuItem
            aria-label={t('options', 'Options')}
            className={styles.menuItem}
            hasDivider
            isDelete
            itemText={isPdf ? t('deletePdf', 'Delete PDF') : t('deleteImage', 'Delete image')}
            onClick={() => onDeleteAttachment(attachmentToPreview)}
          />
        </OverflowMenu>
      </div>
      <div className={styles.rightPanel}>
        <h4 className={styles.title}>{attachmentToPreview.filename}</h4>
        {attachmentToPreview?.description ? (
          <p className={classNames(styles.bodyLong01, styles.imageDescription)}>{attachmentToPreview.description}</p>
        ) : null}
      </div>
    </div>
  );
};

export default AttachmentPreview;
