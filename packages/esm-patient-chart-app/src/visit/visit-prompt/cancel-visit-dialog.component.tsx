import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { useVisit, openmrsFetch, showToast, showNotification } from '@openmrs/esm-framework';
import { removeQueuedPatient } from '../hooks/useServiceQueue';
import { useVisitQueueEntry } from '../queue-entry/queue.resource';
import styles from './cancel-visit-dialog.scss';

interface CancelVisitDialogProps {
  patientUuid: string;
  closeModal: () => void;
}

const CancelVisitDialog: React.FC<CancelVisitDialogProps> = ({ patientUuid, closeModal }) => {
  const { t } = useTranslation();
  const { currentVisit, mutate } = useVisit(patientUuid);
  const [submitting, setSubmitting] = useState(false);
  const visitQueryEntry = useVisitQueueEntry(patientUuid, currentVisit?.uuid);

  const cancelActiveVisit = useCallback(() => {
    // TODO: Extend `updateVisit` functionality in esm-framework to support this request
    setSubmitting(true);
    openmrsFetch(`/ws/rest/v1/visit/${currentVisit.uuid}`, {
      headers: {
        'Content-type': 'application/json',
      },
      method: 'POST',
      body: { voided: true },
    }).then(
      () => {
        const queueEntry = visitQueryEntry?.queueEntry;
        mutate();
        closeModal();
        setSubmitting(false);
        if (queueEntry) {
          removeQueuedPatient(queueEntry.queueUuid, queueEntry.queueEntryUuid, new AbortController());
        }

        showToast({
          title: t('visitCancelled', 'Visit cancelled'),
          kind: 'success',
          description: t('visitCancelSuccessMessage', 'Active visit cancelled successfully'),
        });
      },
      (error) => {
        showNotification({
          title: t('errorCancellingVisit', 'Error cancelling visit'),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
        setSubmitting(false);
      },
    );
  }, [closeModal, currentVisit.uuid, mutate, t, visitQueryEntry?.queueEntry]);

  return (
    <div>
      <ModalHeader
        closeModal={closeModal}
        title={t('cancelActiveVisitConfirmation', 'Are you sure you want to cancel this active visit?')}
      />
      <ModalBody>
        <p className={styles.bodyShort02}>
          {t('cancelVisitExplainerMessage', 'Cancelling this visit will delete its associated encounters')}.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button disabled={submitting} kind="danger" onClick={cancelActiveVisit}>
          {submitting ? (
            <InlineLoading description={`${t('loading', 'Loading')} ...`} />
          ) : (
            t('cancelVisit', 'Cancel visit')
          )}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default CancelVisitDialog;
