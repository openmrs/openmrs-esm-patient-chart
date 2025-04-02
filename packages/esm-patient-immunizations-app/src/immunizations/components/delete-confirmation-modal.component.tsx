import React from 'react';
import { Modal, Button, Stack } from '@carbon/react';
import { useTranslation } from 'react-i18next';

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemLabel: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ open, onClose, onConfirm, itemLabel }) => {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onRequestClose={onClose}
      modalHeading={t('confirmDelete', 'Confirm delete')}
      modalLabel={t('delete', 'Delete')}
      primaryButtonText={t('yesDelete', 'Yes, delete')}
      secondaryButtonText={t('cancel', 'Cancel')}
      onRequestSubmit={onConfirm}
      danger
    >
      <p>{t('areYouSureDelete', `Are you sure you want to delete this ${itemLabel}? This action cannot be undone.`)}</p>
    </Modal>
  );
};

export default DeleteConfirmationModal;
