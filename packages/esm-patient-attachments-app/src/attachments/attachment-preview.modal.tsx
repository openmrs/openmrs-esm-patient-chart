import React from 'react';
import { ModalBody, ModalHeader } from '@carbon/react';
import { type Attachment } from '@openmrs/esm-framework';
import Linkify from 'linkify-react';
import AttachmentMedia from './attachment-media.component';
import styles from './attachment-preview.modal.scss';

interface AttachmentPreviewModalProps {
  attachment: Attachment;
  closeModal: () => void;
}

/**
 * Read-only preview of one attachment, for launching from other apps with
 * `showModal('attachment-preview-modal', { attachment, closeModal })`. The Attachments page keeps
 * its own full-screen preview with the delete action.
 */
const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({ attachment, closeModal }) => {
  return (
    <>
      <ModalHeader closeModal={closeModal} title={attachment.filename}>
        {attachment.description ? (
          <p className={styles.description}>
            <Linkify options={{ target: '_blank' }}>{attachment.description}</Linkify>
          </p>
        ) : null}
      </ModalHeader>
      <ModalBody className={styles.body}>
        <AttachmentMedia attachment={attachment} imageClassName={styles.image} pdfClassName={styles.pdf} />
      </ModalBody>
    </>
  );
};

export default AttachmentPreviewModal;
