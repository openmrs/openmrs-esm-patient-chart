import React, { useState } from 'react';
import styles from './attachments-grid-overview.scss';
import { Attachment } from './attachments-types';
import AttachmentThumbnail from './attachment-thumbnail.component';
import { Button, OverflowMenu, OverflowMenuItem, SkeletonPlaceholder } from 'carbon-components-react';
import Close from '@carbon/icons-react/es/close/24';
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

  if (imageSelected) {
    return <ImagePreview closePreview={() => setImageSelected(null)} imageSelected={imageSelected} />;
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
    </div>
  );
};

interface ImagePreviewProps {
  closePreview: any;
  imageSelected: Attachment;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ closePreview, imageSelected }) => {
  console.log('in');

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
        <img className={styles.attachmentImage} src={imageSelected.src} alt={imageSelected.title} />
        <OverflowMenu className={styles.imagePreviewActions} flipped>
          <OverflowMenuItem itemText={'Delete'} isDelete />
        </OverflowMenu>
      </div>
      <div className={styles.rightPanel}>
        <p className={styles.productiveheading02}>{imageSelected.title}</p>
        <p className={styles.bodyLong01}>Description</p>
      </div>
    </div>
  );
};

export default AttachmentsGridOverview;
