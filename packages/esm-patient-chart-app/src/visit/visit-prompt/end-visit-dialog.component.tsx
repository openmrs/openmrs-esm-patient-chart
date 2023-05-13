import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { parseDate, showNotification, showToast, updateVisit, useVisit } from '@openmrs/esm-framework';
import { first } from 'rxjs/operators';
import styles from './end-visit-dialog.scss';
import { useVisitQueueEntry } from '../queue-entry/queue.resource';
import { removeQueuedPatient } from '../hooks/useServiceQueue';

interface EndVisitDialogProps {
  patientUuid: string;
  closeModal: () => void;
}

const EndVisitDialog: React.FC<EndVisitDialogProps> = ({ patientUuid, closeModal }) => {
  const { t } = useTranslation();
  const { currentVisit, mutate } = useVisit(patientUuid);
  const { queueEntry } = useVisitQueueEntry(patientUuid, currentVisit?.uuid);

  const endCurrentVisit = () => {
    const endVisitPayload = {
      location: currentVisit.location.uuid,
      startDatetime: parseDate(currentVisit.startDatetime),
      visitType: currentVisit.visitType.uuid,
      stopDatetime: new Date(),
    };

    const abortController = new AbortController();
    updateVisit(currentVisit.uuid, endVisitPayload, abortController)
      .pipe(first())
      .subscribe(
        (response) => {
          if (response.status === 200) {
            if (queueEntry) {
              removeQueuedPatient(queueEntry.queueUuid, queueEntry.queueEntryUuid, abortController);
            }
            mutate();
            closeModal();

            showToast({
              critical: true,
              kind: 'success',
              description: t('visitEndSuccessfully', `${response?.data?.visitType?.display} ended successfully`),
              title: t('visitEnded', 'Visit ended'),
            });
          }
        },
        (error) => {
          showNotification({
            title: t('endVisitError', 'Error ending active visit'),
            kind: 'error',
            critical: true,
            description: error?.message,
          });
        },
      );
  };

  return (
    <div>
      <ModalHeader
        closeModal={closeModal}
        label={t('visit', 'Visit')}
        title={t('endActiveVisit', 'End active visit')}
      />
      <ModalBody>
        <p className={styles.bodyShort02}>
          {t(
            'endVisitWarningMessage',
            'Ending this visit will not allow you to fill another encounter form for this patient',
          )}
          .
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={endCurrentVisit}>
          {t('endVisit_title', 'End Visit')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default EndVisitDialog;
