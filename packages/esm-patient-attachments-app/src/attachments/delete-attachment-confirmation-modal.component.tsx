import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalHeader, ModalBody, ModalFooter } from '@carbon/react';
import { Attachment } from '../attachments-types';
import styles from './delete-attachment-confirmation-modal.scss';

interface DeleteAttachmentConfirmationProps {
  attachment: Attachment;
  close: Function;
  onConfirmation: Function;
}

const DeleteAttachmentConfirmation: React.FC<DeleteAttachmentConfirmationProps> = ({
  close,
  attachment,
  onConfirmation,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <ModalHeader closeModal={close} className={styles.productiveHeading03}>
        {t('delete', 'Delete')} {attachment.bytesContentFamily.toLowerCase()} ?
      </ModalHeader>
      <ModalBody>
        <p className={styles.bodyLong01}>
          {t(
            'deleteAttachmentConfirmationText',
            `Are you sure you want to delete this {{attachmentType}}? This action can't be undone.`,
            {
              attachmentType: attachment.bytesContentFamily.toLowerCase(),
            },
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button size="lg" kind="secondary" onClick={() => close()}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button size="lg" kind="danger" onClick={() => onConfirmation?.(attachment)} autoFocus>
          {t('delete', 'Delete')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeleteAttachmentConfirmation;
