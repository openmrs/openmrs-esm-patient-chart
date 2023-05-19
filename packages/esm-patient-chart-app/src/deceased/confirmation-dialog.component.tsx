import React from 'react';

import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { useTranslation } from 'react-i18next';

interface ConfirmationDialogProps {
  closeDialog: () => void;
  handleSubmit: (e: any) => void;
}

const ConfirmMarkAsDeceasedDialog: React.FC<ConfirmationDialogProps> = ({ closeDialog, handleSubmit }) => {
  const { t } = useTranslation();

  return (
    <div>
      <ModalHeader closeModal={closeDialog} title={t('confirmDeceased', 'Confirm Deceased')} />
      <ModalBody>{t('markAsDeceased', 'Are you sure you want to mark patient as deceased?')}</ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeDialog}>
          {t('no', 'No')}
        </Button>
        <Button
          kind="danger"
          onClick={(e) => {
            closeDialog();
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
