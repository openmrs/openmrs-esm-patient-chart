import React from 'react';

import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { useTranslation } from 'react-i18next';

interface ConfirmationDialogProps {
  closeModal: () => void;
  handleSubmit: (e: any) => void;
}

const ConfirmMarkAsDeceasedDialog: React.FC<ConfirmationDialogProps> = ({ closeModal, handleSubmit }) => {
  const { t } = useTranslation();

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('confirmDeceased', 'Confirm Deceased')} />
      <ModalBody>{t('markAsDeceased', 'Are you sure you want to mark patient as deceased?')}</ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('no', 'No')}
        </Button>
        <Button
          kind="danger"
          onClick={(e) => {
            closeModal();
            handleSubmit(e);
          }}
        >
          {t('yes', 'Yes')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default ConfirmMarkAsDeceasedDialog;
