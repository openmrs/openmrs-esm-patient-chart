import React from 'react';
import { SkeletonPlaceholder } from '@carbon/react';
import { type Attachment } from '@openmrs/esm-framework';
import AttachmentThumbnail from './attachment-thumbnail.component';
import styles from './attachments-grid-overview.scss';

interface AttachmentsGridOverviewProps {
  isLoading: boolean;
  attachments: Array<Attachment>;
  onOpenAttachment: (attachment: Attachment) => void;
}

const AttachmentsGridOverview: React.FC<AttachmentsGridOverviewProps> = ({
  attachments,
  isLoading,
  onOpenAttachment: openAttachment,
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
      {attachments.map((attachment, i) => {
        const imageProps = {
          src: attachment.src,
          title: attachment.filename,
          style: {},
          onClick: () => openAttachment(attachment),
        };

        const { id, dateTime, bytesMimeType, bytesContentFamily } = attachment;
        const item = { id, dateTime, bytesMimeType, bytesContentFamily };

        return (
          <div key={i}>
            <AttachmentThumbnail imageProps={imageProps} item={item} />
            <p className={styles.title}>{attachment.filename}</p>
            <p className={styles.muted}>{attachment.dateTime}</p>
          </div>
        );
      })}
    </div>
  );
};

export default AttachmentsGridOverview;
