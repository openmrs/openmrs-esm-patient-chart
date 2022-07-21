import React from 'react';
import styles from './attachments-grid-overview.scss';
import { Attachment } from './attachments-types';
import AttachmentThumbnail from './attachment-thumbnail.component';

interface AttachmentsGridOverviewProps {
  attachments: Array<Attachment>;
}

const AttachmentsGridOverview: React.FC<AttachmentsGridOverviewProps> = ({ attachments }) => {
  return (
    <div className={styles.galleryContainer}>
      {attachments.map((attachment) => {
        const imageProps = {
          src: attachment.src,
          title: attachment.title,
          style: {},
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

export default AttachmentsGridOverview;
