import React from 'react';
import styles from './attachments-grid-overview.scss';
import { Attachment } from './attachments-types';
import AttachmentThumbnail from './attachment-thumbnail.component';
import { SkeletonPlaceholder } from 'carbon-components-react';

interface AttachmentsGridOverviewProps {
  isLoading: boolean;
  attachments: Array<Attachment>;
  deleteAttachment: (attachment: Attachment) => void;
  onAttachmentSelect: (attachment: Attachment) => void;
}

const AttachmentsGridOverview: React.FC<AttachmentsGridOverviewProps> = ({
  attachments,
  isLoading,
  onAttachmentSelect,
}) => {
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
      {attachments.map((attachment, indx) => {
        const imageProps = {
          src: attachment.src,
          title: attachment.title,
          style: {},
          onClick: () => {
            onAttachmentSelect(attachment);
          },
        };
        const item = {
          id: attachment.id,
          dateTime: attachment.dateTime,
          bytesMimeType: attachment.bytesMimeType,
          bytesContentFamily: attachment.bytesContentFamily,
        };
        return (
          <div key={indx}>
            <AttachmentThumbnail imageProps={imageProps} item={item} />
            <p className={styles.bodyLong01}>{attachment.title}</p>
            <p className={`${styles.bodyLong01} ${styles.muted}`}>{attachment.dateTime}</p>
          </div>
        );
      })}
    </div>
  );
};

export default AttachmentsGridOverview;
