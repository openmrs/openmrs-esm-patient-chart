import React, { useState } from 'react';
import styles from './attachments-grid-overview.scss';
import { Attachment } from './attachments-types';
import AttachmentThumbnail from './attachment-thumbnail.component';
import { Button, OverflowMenu, OverflowMenuItem, SkeletonPlaceholder } from 'carbon-components-react';
import Close from '@carbon/icons-react/es/close/24';
import { useTranslation } from 'react-i18next';
interface AttachmentsGridOverviewProps {
  isLoading: boolean;
  attachments: Array<Attachment>;
}

const AttachmentsGridOverview: React.FC<AttachmentsGridOverviewProps> = ({ attachments, isLoading }) => {
  const [imageSelected, setImageSelected] = useState<Attachment>(null);
  if (isLoading) {
    return (
      <div className={styles.galleryContainer}>
        <SkeletonPlaceholder className={styles.attachmentThumbnailSkeleton} />
        <SkeletonPlaceholder className={styles.attachmentThumbnailSkeleton} />
        <SkeletonPlaceholder className={styles.attachmentThumbnailSkeleton} />
        <SkeletonPlaceholder className={styles.attachmentThumbnailSkeleton} />
      </div>
    );
  }

  return (
    <div className={styles.galleryContainer}>
      {attachments.map((attachment) => {
        const imageProps = {
          src: attachment.src,
          title: attachment.title,
          style: {},
          onClick: () => {
            console.log('clicked');
            setImageSelected(attachment);
          },
        };
        const item = {
          id: attachment.id,
          dateTime: attachment.dateTime,
          bytesMimeType: attachment.bytesMimeType,
          bytesContentFamily: attachment.bytesContentFamily,
        };
        return (
          <div>
            <AttachmentThumbnail imageProps={imageProps} item={item} />
            <p className={styles.bodyLong01}>{attachment.title}</p>
            <p className={`${styles.bodyLong01} ${styles.muted}`}>{attachment.dateTime}</p>
          </div>
        );
      })}
      {imageSelected && <ImagePreview closePreview={() => setImageSelected(null)} imageSelected={imageSelected} />}
    </div>
  );
};

interface ImagePreviewProps {
  closePreview: any;
  imageSelected: Attachment;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ closePreview, imageSelected }) => {
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
          <OverflowMenu flipped>
            <OverflowMenuItem itemText={t('deleteImage', 'Delete')} isDelete />
          </OverflowMenu>
        </div>
      </div>
      <div className={styles.rightPanel}>
        <h4 className={styles.productiveHeading02}>{imageSelected.title}</h4>
        <p className={`${styles.bodyLong01} ${styles.imageDescription}`}>Description</p>
      </div>
    </div>
  );
};

export default AttachmentsGridOverview;
