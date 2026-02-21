import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalHeader, ModalBody, ModalFooter } from '@carbon/react';
import { getCoreTranslation, type Attachment } from '@openmrs/esm-framework';
import { useFocusTrap } from '@openmrs/esm-patient-common-lib';
import styles from './delete-attachment.scss';

interface DeleteAttachmentConfirmationProps {
  attachment: Attachment;
  close: () => void;
  onConfirmation: (attachment: Attachment) => void;
}

const DeleteAttachmentConfirmation: React.FC<DeleteAttachmentConfirmationProps> = ({
  close,
  attachment,
  onConfirmation,
}) => {
  const { t } = useTranslation();
  const containerRef = useFocusTrap();

  return (
    <div role="dialog" aria-modal="true" ref={containerRef}>
      <ModalHeader closeModal={close} className={styles.modalHeader}>
        {t('deleteAttachment', 'Delete attachment')}
      </ModalHeader>
      <ModalBody>
        <p className={styles.bodyText}>
          {t(
            'deleteAttachmentConfirmationText',
            'Are you sure you want to delete the attachment "{{fileName}}"? This action can\'t be undone.',
            {
              fileName: attachment.filename,
            },
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button size="lg" kind="secondary" onClick={() => close()}>
          {getCoreTranslation('cancel')}
        </Button>
        <Button autoFocus kind="danger" onClick={() => onConfirmation?.(attachment)} size="lg">
          {getCoreTranslation('delete')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default DeleteAttachmentConfirmation;
