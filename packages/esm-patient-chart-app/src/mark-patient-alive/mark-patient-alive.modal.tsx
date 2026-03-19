import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { invalidateCurrentVisit, invalidateVisitAndEncounterData } from '@openmrs/esm-patient-common-lib';
import { showSnackbar } from '@openmrs/esm-framework';
import { markPatientAlive } from '../data.resource';

interface MarkPatientAliveProps {
  closeModal: () => void;
  patientUuid: string;
}

const MarkPatientAlive: React.FC<MarkPatientAliveProps> = ({ closeModal, patientUuid }) => {
  const { t } = useTranslation();
  const { mutate: globalMutate } = useSWRConfig();

  const handleSubmit = useCallback(() => {
    closeModal();

    markPatientAlive(patientUuid)
      .then(() => {
        globalMutate((key) => Array.isArray(key) && key[0] === 'patient' && key[1] === patientUuid);
        invalidateCurrentVisit(globalMutate, patientUuid);
        invalidateVisitAndEncounterData(globalMutate, patientUuid);
        showSnackbar({
          title: t('markAliveSuccessfully', 'Patient marked alive successfully'),
        });
      })
      .catch((error) => {
        showSnackbar({
          title: t('errorMarkingPatientAlive', 'Error marking patient alive'),
          kind: 'error',
          isLowContrast: false,
          subtitle: error?.message,
        });
      });
  }, [closeModal, globalMutate, patientUuid, t]);

  return (
    <>
      <ModalHeader closeModal={closeModal} title={t('markPatientAlive', 'Mark patient alive')} />
      <ModalBody>{t('markPatientAliveConfirmation', 'Are you sure you want to mark this patient alive?')}</ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('no', 'No')}
        </Button>
        <Button onClick={handleSubmit}>{t('yes', 'Yes')}</Button>
      </ModalFooter>
    </>
  );
};

export default MarkPatientAlive;
