import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';

import { showToast, showNotification, fhirBaseUrl } from '@openmrs/esm-framework';
import { Button, ModalFooter, ModalHeader, ModalBody } from '@carbon/react';
import { markPatientAlive } from './deceased.resource';

interface ConfirmationDialogProps {
  closeDialog: () => void;
  patientUuid: string;
}

const MarkPatientAsAlive: React.FC<ConfirmationDialogProps> = ({ closeDialog, patientUuid }) => {
  const { t } = useTranslation();
  const { mutate } = useSWRConfig();

  const handleSubmit = (e) => {
    e.preventDefault();
    closeDialog();
    markPatientAlive(patientUuid, new AbortController())
      .then((response) => {
        if (response.ok) {
          closeDialog();
          showToast({
            critical: true,
            kind: 'success',
            title: t('markAsAlive', 'Mark As Alive'),
            description: t('setAliveSuccessfully', 'Patient has been marked alive successfully'),
          });
          mutate(`${fhirBaseUrl}/patient/${patientUuid}`);
        }
      })
      .catch((error) => {
        showNotification({
          title: t('setAliveError', 'Error marking patient alive'),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
      });
  };

  return (
    <div>
      <ModalHeader closeModal={closeDialog} title={t('markAsAlive', 'Mark As Alive')} />
      <ModalBody>{t('confirmMarkAsAlive', 'Are you sure, you want to mark patient as alive?')}</ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeDialog}>
          {t('no', 'No')}
        </Button>
        <Button onClick={(e) => handleSubmit(e)}>{t('yes', 'Yes')}</Button>
      </ModalFooter>
    </div>
  );
};

export default MarkPatientAsAlive;
