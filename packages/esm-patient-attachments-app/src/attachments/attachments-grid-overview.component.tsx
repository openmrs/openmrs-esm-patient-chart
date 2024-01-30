import React from 'react';
import classNames from 'classnames';
import { SkeletonPlaceholder } from '@carbon/react';
import { type Attachment } from '@openmrs/esm-framework';
import AttachmentThumbnail from './attachment-thumbnail.component';
import styles from './attachments-grid-overview.scss';

interface AttachmentsGridOverviewProps {
  isLoading: boolean;
  attachments: Array<Attachment>;
  deleteAttachment: (attachment: Attachment) => void;
  openAttachment: (attachment: Attachment) => void;
}

const AttachmentsGridOverview: React.FC<AttachmentsGridOverviewProps> = ({
  attachments,
  isLoading,
  openAttachment,
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
            openAttachment(attachment);
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
            <p className={styles.title}>{attachment.title}</p>
            <p className={styles.muted}>{attachment.dateTime}</p>
          </div>
        );
      })}
    </div>
  );
};

export default AttachmentsGridOverview;
