import React from 'react';
import { useTranslation } from 'react-i18next';

import { showSnackbar } from '@openmrs/esm-framework';
import { Button, ModalFooter, ModalHeader, ModalBody } from '@carbon/react';
import { markPatientAlive } from './deceased.resource';

interface ConfirmationDialogProps {
  closeModal: () => void;
  patientUuid: string;
}

const MarkPatientAsAlive: React.FC<ConfirmationDialogProps> = ({ closeModal, patientUuid }) => {
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    closeModal();
    markPatientAlive(patientUuid, new AbortController())
      .then((response) => {
        if (response.ok) {
          closeModal();
          showSnackbar({
            isLowContrast: true,
            kind: 'success',
            title: t('markAsAlive', 'Mark As Alive'),
            subtitle: t('setAliveSuccessfully', 'Patient has been marked alive successfully'),
          });
        }
      })
      .catch((error) => {
        showSnackbar({
          title: t('setAliveError', 'Error marking patient alive'),
          kind: 'error',
          isLowContrast: false,
          subtitle: error?.message,
        });
      });
  };

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('markAsAlive', 'Mark As Alive')} />
      <ModalBody>{t('confirmMarkAsAlive', 'Are you sure, you want to mark patient as alive?')}</ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('no', 'No')}
        </Button>
        <Button onClick={(e) => handleSubmit(e)}>{t('yes', 'Yes')}</Button>
      </ModalFooter>
    </div>
  );
};

export default MarkPatientAsAlive;
