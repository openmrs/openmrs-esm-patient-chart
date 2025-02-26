import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { setCurrentVisit, showSnackbar, updateVisit, useVisit } from '@openmrs/esm-framework';
import { useVisitQueueEntry } from '../queue-entry/queue.resource';
import { removeQueuedPatient } from '../hooks/useServiceQueue';
import styles from './end-visit-dialog.scss';
import { useMutateVisits } from '@openmrs/esm-patient-common-lib/src';

interface EndVisitDialogProps {
  patientUuid: string;
  closeModal: () => void;
}

const EndVisitDialog: React.FC<EndVisitDialogProps> = ({ patientUuid, closeModal }) => {
  const { t } = useTranslation();
  const { currentVisit, currentVisitIsRetrospective } = useVisit(patientUuid);
  const {mutateVisits} = useMutateVisits();
  const { queueEntry } = useVisitQueueEntry(patientUuid, currentVisit?.uuid);

  const handleEndVisit = () => {
    if (currentVisitIsRetrospective) {
      setCurrentVisit(null, null);
      closeModal();
    } else {
      const endVisitPayload = {
        stopDatetime: new Date(),
      };

      const abortController = new AbortController();

      updateVisit(currentVisit.uuid, endVisitPayload, abortController)
        .then((response) => {
          if (queueEntry) {
            removeQueuedPatient(
              queueEntry.queue.uuid,
              queueEntry.queueEntryUuid,
              abortController,
              response?.data.stopDatetime,
            );
          }
          mutateVisits(patientUuid, currentVisit.uuid);
          closeModal();

          showSnackbar({
            isLowContrast: true,
            kind: 'success',
            subtitle: t('visitEndSuccessfully', `${response?.data?.visitType?.display} ended successfully`),
            title: t('visitEnded', 'Visit ended'),
          });
        })
        .catch((error) => {
          showSnackbar({
            title: t('errorEndingVisit', 'Error ending visit'),
            kind: 'error',
            isLowContrast: false,
            subtitle: error?.message,
          });
        });
    }
  };

  return (
    <div>
      <ModalHeader
        closeModal={closeModal}
        title={t('endActiveVisitConfirmation', 'Are you sure you want to end this active visit?')}
      />
      <ModalBody>
        <p className={styles.bodyShort02}>
          {t(
            'endVisitExplainerMessage',
            'Ending this visit means that you will no longer be able to add encounters to it. If you need to add an encounter, you can create a new visit for this patient or edit a past one.',
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={handleEndVisit}>
          {t('endVisit_title', 'End Visit')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default EndVisitDialog;
