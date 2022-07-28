import { attach } from '@openmrs/esm-framework';
import { ButtonSet, Button } from 'carbon-components-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Attachment } from './attachments-types';
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
    <div className={styles.container}>
      <h3 className={styles.productiveHeading03}>
        {t('delete', 'Delete')} {attachment.bytesContentFamily.toLowerCase()} ?
      </h3>
      <p className={styles.bodyLong01}>
        {t(
          'deleteAttachmentConfirmationText',
          `Are you sure you want to delete this ${attachment.bytesContentFamily.toLowerCase()}? This action can't be undone.`,
        )}
      </p>
      <ButtonSet className={styles.buttonSet}>
        <Button size="lg" kind="secondary" onClick={() => close()}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button size="lg" kind="danger" onClick={() => onConfirmation?.(attachment)}>
          {t('delete', 'Delete')}
        </Button>
      </ButtonSet>
    </div>
  );
};

export default DeleteAttachmentConfirmation;
