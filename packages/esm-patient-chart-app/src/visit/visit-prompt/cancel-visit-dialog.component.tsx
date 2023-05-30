import React, { useCallback, useState } from 'react';
import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { useVisit, openmrsFetch, showToast, showNotification } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './cancel-visit-dialog.scss';
import { useVisitQueueEntry } from '../queue-entry/queue.resource';
import { removeQueuedPatient } from '../hooks/useServiceQueue';

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
    // TO DO expand updateVisit function in esm-api to support this request
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
          title: t('cancelVisit', 'Cancel visit'),
          kind: 'success',
          description: t('visitCanceled', 'Canceled active visit successfully'),
        });
      },
      (error) => {
        showNotification({
          title: t('cancelVisitError', 'Error cancelling active visit'),
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
        label={t('visit', 'Visit')}
        title={t('cancelActiveVisit', 'Cancel active visit')}
      />
      <ModalBody>
        <p className={styles.bodyShort02}>
          {t('cancelVisitWarningMessage', 'Cancelling this visit will delete all associated encounters')}.
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
