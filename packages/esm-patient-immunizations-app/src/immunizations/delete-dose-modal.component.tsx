import React from 'react';
import { ModalHeader, Button, Stack , ModalBody , ModalFooter } from '@carbon/react';
import { useTranslation } from 'react-i18next';

interface Props {
  onClose: () => void;
  onConfirm: () => void;
  itemLabel?: string;
}

const DeleteDoseModal: React.FC<Props> = ({ onClose, onConfirm, itemLabel = 'dose' }) => {
  const { t } = useTranslation();

  return (
    <>
      <ModalHeader closeModal={onClose}>{t('confirmDelete', 'Confirm delete')}</ModalHeader>

      <ModalBody>
        {t('areYouSureDelete', `Are you sure you want to delete this ${itemLabel}? This action cannot be undone.`)}
      </ModalBody>

      <ModalFooter>
        <Stack orientation="horizontal" gap={3}>
          <Button kind="secondary" onClick={onClose}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button kind="danger" onClick={onConfirm}>
            {t('yesDelete', 'Yes, delete')}
          </Button>
        </Stack>
      </ModalFooter>
    </>
  );
};

export default DeleteDoseModal;
